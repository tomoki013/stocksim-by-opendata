import { Company } from '../types/stockGame';

export function updateStockPrices(companies: Company[]): Company[] {
    return companies.map((company) => {
        const change = Math.floor(Math.random() * 21) - 10;
        const upwardBias = Math.random() < 0.55 ? 1 : 0;
        const newPrice = Math.max(0, Math.min(20000, company.currentPrice + change + upwardBias));
        return {
            ...company,
            previousPrice: company.currentPrice,
            currentPrice: newPrice,
        };
    });
}

export function advanceTime(currentTime: string): { newTime: string; isAfterHours: boolean } {
    const [hours, minutes] = currentTime.split(':').map(Number);
    let newMinutes = minutes + 15;
    let newHours = hours;
    if (newMinutes >= 60) {
        newMinutes = 0;
        newHours += 1;
    }
    const newTimeString = `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
    return {
        newTime: newTimeString,
        isAfterHours: newTimeString === '15:30',
    };
}
