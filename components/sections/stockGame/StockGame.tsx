'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { INITIAL_COMPANIES } from '@/data/initialCompanies';
// 4つのCSVファイルから直接テキストデータをインポート
import stockDataCsv1 from '@/data/nikkei_stock_average_daily_jp.csv'
import stockDataCsv2 from '@/data/nikkei_225_futures_index_series_daily_jp.csv'
import stockDataCsv3 from '@/data/nikkei_225_total_return_index_daily_jp.csv'
import stockDataCsv4 from '@/data/nikkei_225_covered_call_index_daily_jp.csv'
import { parseMultipleStockData } from '@/lib/csvUtils';
import { calculateCurrentPrices, advanceTime } from '@/lib/stockGameUtils';
import CompanyList from './CompanyList';
import PortfolioSummary from './PortfolioSummary';
import TradeDialog from '@/components/elements/TradeDialog';
import AfterHoursDialog from '@/components/elements/AfterHoursDialog';
import { Company, GameState } from '@/types/stockGame';

const INITIAL_STATE: GameState = {
    isStarted: false,
    currentDay: 1,
    currentTime: '09:00',
    cash: 100000,
    companies: INITIAL_COMPANIES,
    isPaused: false,
    isAfterHours: false,
    stockMarketData: [],
};

const StockGame = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [showAfterHoursDialog, setShowAfterHoursDialog] = useState(false);
    const [showTradeDialog, setShowTradeDialog] = useState(false);
    const [tradeAmount, setTradeAmount] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isBuying, setIsBuying] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        // 4つのCSV文字列を配列にまとめてパース
        const csvStrings = [stockDataCsv1, stockDataCsv2, stockDataCsv3, stockDataCsv4];
        const parsedDataSources = parseMultipleStockData(csvStrings);
        setGameState(prev => ({ ...prev, stockMarketData: parsedDataSources }));
    }, []);

    const updateStocks = useCallback(() => {
        if (gameState.stockMarketData.length === 0) return;
        setGameState((prev) => ({
            ...prev,
            companies: calculateCurrentPrices(prev.companies, prev.currentDay, prev.currentTime, prev.stockMarketData),
        }));
    }, [gameState.stockMarketData]);

    const advanceGameTime = useCallback(() => {
        setGameState((prev) => {
            const { newTime, isAfterHours } = advanceTime(prev.currentTime);
            if (isAfterHours) {
                return {
                    ...prev,
                    currentTime: newTime,
                    isAfterHours: true,
                    isPaused: true,
                };
            }
            return {
                ...prev,
                currentTime: newTime,
            };
        });
    }, []);

    useEffect(() => {
        if (!gameState.isStarted || gameState.isPaused) return;

        const gameTickInterval = setInterval(() => {
            updateStocks();
            advanceGameTime();
        }, 2000);

        return () => {
            clearInterval(gameTickInterval);
        };
    }, [gameState.isStarted, gameState.isPaused, updateStocks, advanceGameTime]);

    useEffect(() => {
        if (gameState.isAfterHours) {
            setShowAfterHoursDialog(true);
            const timer = setTimeout(() => {
                setShowAfterHoursDialog(false);
                setGameState((prev) => {
                    const nextDay = prev.currentDay + 1;
                    
                    const updatedCompanies = prev.companies.map(c => ({
                        ...c,
                        dayStartPrice: c.currentPrice,
                    }));

                    return {
                        ...prev,
                        currentDay: nextDay,
                        currentTime: '09:00',
                        isAfterHours: false,
                        isPaused: false,
                        companies: updatedCompanies,
                    };
                });
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [gameState.isAfterHours, gameState.companies]);

    const handleStartGame = () => {
        setGameState((prev) => ({
            ...prev,
            isStarted: true,
        }));
    };
    
    const handleTradeClick = (company: Company, buying: boolean) => {
        setSelectedCompany(company);
        setIsBuying(buying);
        setTradeAmount('');
        setShowTradeDialog(true);
        setGameState(prev => ({ ...prev, isPaused: true }));
    };

    const handleTrade = () => {
        if (!selectedCompany || !tradeAmount) {
            setErrorMessage('株数を入力してください。');
            return;
        }

        const shares = parseInt(tradeAmount);
        if (isNaN(shares) || shares <= 0) {
            setErrorMessage('有効な株数を入力してください。');
            return;
        }

        let tradeSuccessful = false;

        setGameState((prev) => {
            const company = prev.companies.find((c) => c.id === selectedCompany.id);
            if (!company) return prev;

            const totalPrice = company.currentPrice * shares;

            if (isBuying) {
                if (totalPrice > prev.cash) {
                    setErrorMessage('残高が不足しています。');
                    return prev;
                }

                tradeSuccessful = true;
                return {
                    ...prev,
                    cash: prev.cash - totalPrice,
                    companies: prev.companies.map((c) =>
                        c.id === company.id ? { ...c, shares: c.shares + shares } : c
                    ),
                    isPaused: false,
                };
            } else {
                if (shares > company.shares) {
                    setErrorMessage('保有株数が不足しています。');
                    return prev;
                }

                tradeSuccessful = true;
                return {
                    ...prev,
                    cash: prev.cash + totalPrice,
                    companies: prev.companies.map((c) =>
                        c.id === company.id ? { ...c, shares: c.shares - shares } : c
                    ),
                    isPaused: false,
                };
            }
        });

        if (tradeSuccessful) {
            setErrorMessage(null);
            setShowTradeDialog(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">株式投資シミュレーター</h1>
                    {!gameState.isStarted && (
                        <Button
                            size="lg"
                            onClick={handleStartGame}
                            disabled={gameState.stockMarketData.length === 0}
                        >
                            {gameState.stockMarketData.length > 0 ? '開始' : 'データ読込中...'}
                        </Button>
                    )}
                    <div className="text-2xl font-semibold mt-4 mb-8">
                        {gameState.currentDay}日目 {gameState.currentTime}
                    </div>
                    <div className="bg-black p-4 rounded-lg mx-auto mb-8">
                        <div className="flex flex-wrap gap-6 justify-evenly items-center">
                            {gameState.companies.map((company) => (
                                <div key={company.id} className="flex flex-col gap2">
                                    <span className="text-orange-500 font-semibold">{company.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-orange-500">¥{company.currentPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <CompanyList
                    companies={gameState.companies}
                    onBuy={company => handleTradeClick(company, true)}
                    onSell={company => handleTradeClick(company, false)}
                    isStarted={gameState.isStarted}
                    isAfterHours={gameState.isAfterHours}
                />
                <PortfolioSummary cash={gameState.cash} companies={gameState.companies} />
                <AfterHoursDialog open={showAfterHoursDialog} onOpenChange={setShowAfterHoursDialog} />
                <TradeDialog
                    open={showTradeDialog}
                    onOpenChange={open => {
                        setShowTradeDialog(open);
                        if (!open) {
                            setErrorMessage(null);
                            setGameState(prev => ({ ...prev, isPaused: false }));
                        }
                    }}
                    company={selectedCompany}
                    isBuying={isBuying}
                    tradeAmount={tradeAmount}
                    onTradeAmountChange={v => {
                        setTradeAmount(v);
                        setErrorMessage(null);
                    }}
                    onTrade={handleTrade}
                    errorMessage={errorMessage}
                    cash={gameState.cash}
                />
            </div>
        </div>
    );
};

export default StockGame;
