export type Company = {
    id: string;
    name: string;
    currentPrice: number;
    previousPrice: number;
    shares: number;
    dayStartPrice: number; // 当日の計算の基準となる始値
};

export type DailyStockData = {
    Date: string;
    [companyName: string]: number | string;
};

export type GameState = {
    isStarted: boolean;
    currentDay: number;
    currentTime: string;
    cash: number;
    companies: Company[];
    isPaused: boolean;
    isAfterHours: boolean;
    stockMarketData: DailyStockData[];
};