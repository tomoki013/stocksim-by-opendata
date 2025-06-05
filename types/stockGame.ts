export type Company = {
    id: string;
    name: string;
    currentPrice: number;
    previousPrice: number;
    shares: number;
};

export type GameState = {
    isStarted: boolean;
    currentDay: number;
    currentTime: string;
    cash: number;
    companies: Company[];
    isPaused: boolean;
    isAfterHours: boolean;
};
