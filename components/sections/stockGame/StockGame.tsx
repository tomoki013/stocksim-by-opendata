'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from 'lucide-react';
import { Company, GameState } from '@/types/index';
import Link from 'next/link';

const INITIAL_COMPANIES: Company[] = [
    { id: '1', name: '株式会社A', currentPrice: 1000, previousPrice: 1000, shares: 0 },
    { id: '2', name: '株式会社B', currentPrice: 1500, previousPrice: 1500, shares: 0 },
    { id: '3', name: '株式会社C', currentPrice: 1700, previousPrice: 1700, shares: 0 },
    { id: '4', name: '株式会社D', currentPrice: 2000, previousPrice: 2000, shares: 0 },
];

const INITIAL_STATE: GameState = {
    isStarted: false,
    currentDay: 1,
    currentTime: '09:00',
    cash: 100000,
    companies: INITIAL_COMPANIES,
    isPaused: false,
    isAfterHours: false,
};

const StockGame = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);
    const [showAfterHoursDialog, setShowAfterHoursDialog] = useState(false);
    const [showTradeDialog, setShowTradeDialog] = useState(false);
    const [tradeAmount, setTradeAmount] = useState('');
    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [isBuying, setIsBuying] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const updateStockPrices = useCallback(() => {
        setGameState((prev) => ({
            ...prev,
            companies: prev.companies.map((company) => {
                const change = Math.floor(Math.random() * 21) - 10;
                const upwardBias = Math.random() < 0.55 ? 1 : 0;
                const newPrice = Math.max(0, Math.min(20000, company.currentPrice + change + upwardBias));
                return {
                    ...company,
                    previousPrice: company.currentPrice,
                    currentPrice: newPrice,
                };
            }),
        }));
    }, []);

    const advanceTime = useCallback(() => {
        setGameState((prev) => {
            const [hours, minutes] = prev.currentTime.split(':').map(Number);
            let newMinutes = minutes + 15;
            let newHours = hours;
            
            if (newMinutes >= 60) {
                newMinutes = 0;
                newHours += 1;
            }
          
            const newTimeString = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
          
            if (newTimeString === '15:30') {
                return {
                    ...prev,
                    currentTime: newTimeString,
                    isAfterHours: true,
                    isPaused: true,
                };
            }
          
            return {
                ...prev,
                currentTime: newTimeString,
            };
        });
    }, []);

    useEffect(() => {
        if (!gameState.isStarted || gameState.isPaused) return;

        const interval = setInterval(() => {
            updateStockPrices();
            advanceTime();
        }, 2000);

        return () => clearInterval(interval);
    }, [gameState.isStarted, gameState.isPaused, updateStockPrices, advanceTime]);

    useEffect(() => {
        if (gameState.isAfterHours) {
            setShowAfterHoursDialog(true);
            const timer = setTimeout(() => {
                setShowAfterHoursDialog(false);
                setGameState((prev) => ({
                    ...prev,
                    currentDay: prev.currentDay + 1,
                    currentTime: '09:00',
                    isAfterHours: false,
                    isPaused: false,
                }));
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [gameState.isAfterHours]);

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

        let tradeSuccessful = false; // 売買が成立したかどうかを追跡

        setGameState((prev) => {
            const company = prev.companies.find((c) => c.id === selectedCompany.id);
            if (!company) return prev;

            const totalPrice = company.currentPrice * shares;

            if (isBuying) {
                if (totalPrice > prev.cash) {
                    setErrorMessage('残高が不足しています。');
                    return prev;
                }

                tradeSuccessful = true; // 売買が成立
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

                tradeSuccessful = true; // 売買が成立
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
            setErrorMessage(null); // エラーメッセージをリセット
            setShowTradeDialog(false); // 売買が成立した場合のみポップアップを閉じる
        }
    };

    const getPriceIndicator = (company: Company) => {
        if (company.currentPrice > company.previousPrice) {
            return <ArrowUpIcon className="text-green-500" />;
        }
        if (company.currentPrice < company.previousPrice) {
            return <ArrowDownIcon className="text-red-800" />;
        }
        return <ArrowRightIcon className="text-gray-500" />;
    };

    const totalStockValue = gameState.companies.reduce(
        (sum, company) => sum + company.currentPrice * company.shares,
        0
    );

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">株式投資シミュレーター</h1>
                    {!gameState.isStarted && (
                        <Button
                            size="lg"
                            onClick={() => setGameState((prev) => ({ ...prev, isStarted: true }))}
                        >
                            開始
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
                                        <span>{getPriceIndicator(company)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                    
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {gameState.companies.map((company) => (
                        <Card key={company.id}>
                            <CardHeader className="bg-muted">
                                <div className="font-semibold">{company.name}</div>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="mb-4">
                                    <div>保有株数: {company.shares.toLocaleString()}株</div>
                                    <div>評価額: ¥{(company.currentPrice * company.shares).toLocaleString()}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => handleTradeClick(company, true)}
                                        disabled={!gameState.isStarted || gameState.isAfterHours}
                                    >
                                        購入
                                    </Button>
                                    <Button
                                        onClick={() => handleTradeClick(company, false)}
                                        disabled={!gameState.isStarted || gameState.isAfterHours || company.shares === 0}
                                    >
                                        売却
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                
                <div className="fixed bottom-0 left-0 right-0 bg-card p-4 border-t">
                    <div className="max-w-7xl mx-auto flex justify-between items-center">
                        <div>現金残高: ¥{gameState.cash.toLocaleString()}</div>
                        <div>株式評価額: ¥{totalStockValue.toLocaleString()}</div>
                        <div>総資産: ¥{(gameState.cash + totalStockValue).toLocaleString()}</div>
                    </div>
                </div>
                
                <Dialog open={showAfterHoursDialog} onOpenChange={setShowAfterHoursDialog}>
                    <DialogContent>
                        <h2 className="text-xl font-semibold mb-4">取引時間外</h2>
                        <p>現在は取引時間外です。翌営業日の開始までお待ちください。</p>
                    </DialogContent>
                </Dialog>
                
                <Dialog
                    open={showTradeDialog}
                    onOpenChange={(open) => {
                        setShowTradeDialog(open);
                        if (!open) {
                            setErrorMessage(null); // ポップアップが閉じられたらエラーメッセージをリセット
                            setGameState((prev) => ({ ...prev, isPaused: false }));
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {selectedCompany?.name}の株式{isBuying ? '購入' : '売却'}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            {errorMessage && (
                                <div className="mb-4 text-red-500 font-semibold">{errorMessage}</div>
                            )}
                            <div className="mb-4">
                                <div>現在の株価: ¥{selectedCompany?.currentPrice.toLocaleString()}</div>
                                {isBuying ? (
                                    <div>現在の現金残高: ¥{gameState.cash.toLocaleString()}</div>
                                ) : (
                                    <div>保有株数: {selectedCompany?.shares.toLocaleString()}株</div>
                                )}
                            </div>
                            <Input
                                type="number"
                                placeholder="株数を入力"
                                value={tradeAmount}
                                onChange={(e) => {
                                    setTradeAmount(e.target.value);
                                    setErrorMessage(null); // 入力時にエラーメッセージをリセット
                                }}
                                min="1"
                                max={
                                    isBuying
                                        ? Math.floor(gameState.cash / (selectedCompany?.currentPrice || 1))
                                        : selectedCompany?.shares
                                }
                            />
                            {tradeAmount && selectedCompany && (
                                <div className="mt-2">
                                    取引金額: ¥{(parseInt(tradeAmount) * selectedCompany.currentPrice).toLocaleString()}
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button onClick={handleTrade}>確定</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <div className="mt-8 text-center">
                    <Link href={"/game"} className='hover:underline'>
                        ゲーム一覧に戻る
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default StockGame;
