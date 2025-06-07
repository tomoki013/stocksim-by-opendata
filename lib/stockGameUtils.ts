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

    if (dataLength < 2) return companies; // ループに必要な最低限のデータがない場合は何もしない

    return companies.map((company, index) => {
        // ループさせるために剰余演算子(%)を使用
        const startDataIndex = (day - 1 + index) % (dataLength - 1);
        const endDataIndex = (startDataIndex + 1) % dataLength;

        const startData = marketData[startDataIndex];
        const endData = marketData[endDataIndex];

        // データソースの '終値' カラムの価格差を取得する
        const priceDiffFromData = ((endData[DATA_SOURCE_COLUMN_NAME] as number) - (startData[DATA_SOURCE_COLUMN_NAME] as number));

        if (isNaN(priceDiffFromData)) {
            return company;
        }

        const changePerInterval = priceDiffFromData / TRADING_SESSIONS_PER_DAY;
        const newPrice = Math.round(company.dayStartPrice + (changePerInterval * intervalsPassed));

        // 価格が0未満にならないように調整
        const finalPrice = Math.max(0, newPrice);

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