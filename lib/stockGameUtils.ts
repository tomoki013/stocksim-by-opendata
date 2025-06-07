import { Company, DailyStockData } from '../types/stockGame';

const TRADING_SESSIONS_PER_DAY = 26; // 9:00から15:15まで15分ごとに26回
const DATA_SOURCE_COLUMN_NAME = '終値'; // 全ての変動の基準となるカラム名

export function calculateCurrentPrices(
    companies: Company[],
    day: number,
    currentTime: string,
    marketData: DailyStockData[]
): Company[] {
    const [hours, minutes] = currentTime.split(':').map(Number);
    const intervalsPassed = (hours - 9) * 4 + Math.floor(minutes / 15);
    const dataLength = marketData.length;

    if (dataLength < 2) return companies;

    return companies.map((company, index) => {
        const startDataIndex = (day - 1 + index) % (dataLength - 1);
        const endDataIndex = (startDataIndex + 1) % dataLength;

        const startData = marketData[startDataIndex];
        const endData = marketData[endDataIndex];

        const startPriceFromData = startData[DATA_SOURCE_COLUMN_NAME] as number;
        const endPriceFromData = endData[DATA_SOURCE_COLUMN_NAME] as number;
        
        // 変化率(%)を計算
        if (isNaN(startPriceFromData) || isNaN(endPriceFromData) || startPriceFromData === 0) {
            return company; // データが不正な場合は更新しない
        }
        const percentageChange = (endPriceFromData - startPriceFromData) / startPriceFromData;

        // 企業の当日の始値に変化率を適用して、その日の総変動額を計算
        const totalDayChange = company.dayStartPrice * percentageChange;

        // 15分ごとの変動額を計算
        const changePerInterval = totalDayChange / TRADING_SESSIONS_PER_DAY;
        
        // 当日の始値を基準に変動を計算
        const newPrice = company.dayStartPrice + (changePerInterval * intervalsPassed);

        // 価格が0未満にならないように調整し、四捨五入
        const finalPrice = Math.max(0, Math.round(newPrice));

        return {
            ...company,
            previousPrice: company.currentPrice,
            currentPrice: finalPrice,
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