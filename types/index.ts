export interface Company {
    id: string;
    name: string;
    currentPrice: number;
    previousPrice: number;
    shares: number;
}
  
export interface GameState {
    isStarted: boolean;
    currentDay: number;
    currentTime: string;
    cash: number;
    companies: Company[];
    isPaused: boolean;
    isAfterHours: boolean;
}
