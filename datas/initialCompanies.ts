import { Company } from '../types/stockGame';

// ユーザーが設定する初期株価
const initialPrices = {
    '株式会社A': 1000,
    '株式会社B': 1500,
    '株式会社C': 1700,
    '株式会社D': 2000,
};

export const INITIAL_COMPANIES: Company[] = [
    { id: '1', name: '株式会社A', currentPrice: initialPrices['株式会社A'], previousPrice: initialPrices['株式会社A'], shares: 0, dayStartPrice: initialPrices['株式会社A'], volatility: 0.8 },
    { id: '2', name: '株式会社B', currentPrice: initialPrices['株式会社B'], previousPrice: initialPrices['株式会社B'], shares: 0, dayStartPrice: initialPrices['株式会社B'], volatility: 1.0 },
    { id: '3', name: '株式会社C', currentPrice: initialPrices['株式会社C'], previousPrice: initialPrices['株式会社C'], shares: 0, dayStartPrice: initialPrices['株式会社C'], volatility: 1.2 },
    { id: '4', name: '株式会社D', currentPrice: initialPrices['株式会社D'], previousPrice: initialPrices['株式会社D'], shares: 0, dayStartPrice: initialPrices['株式会社D'], volatility: 1.5 },
];