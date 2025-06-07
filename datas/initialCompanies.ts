import { Company } from '../types/stockGame';

// ユーザーが設定する初期株価
const initialPrices = {
    '株式会社A': 1000,
    '株式会社B': 1500,
    '株式会社C': 1700,
    '株式会社D': 2000,
};

export const INITIAL_COMPANIES: Company[] = [
    { id: '1', name: '株式会社A', currentPrice: initialPrices['株式会社A'], previousPrice: initialPrices['株式会社A'], shares: 0, dayStartPrice: initialPrices['株式会社A'] },
    { id: '2', name: '株式会社B', currentPrice: initialPrices['株式会社B'], previousPrice: initialPrices['株式会社B'], shares: 0, dayStartPrice: initialPrices['株式会社B'] },
    { id: '3', name: '株式会社C', currentPrice: initialPrices['株式会社C'], previousPrice: initialPrices['株式会社C'], shares: 0, dayStartPrice: initialPrices['株式会社C'] },
    { id: '4', name: '株式会社D', currentPrice: initialPrices['株式会社D'], previousPrice: initialPrices['株式会社D'], shares: 0, dayStartPrice: initialPrices['株式会社D'] },
];