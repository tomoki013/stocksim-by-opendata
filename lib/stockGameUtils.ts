import { Company, DailyStockData } from '../types/stockGame';

const DATA_SOURCE_COLUMN_NAME = '終値'; // 市場の方向性を決めるためのカラム名
const BASE_FLUCTUATION = 10; // ★ 変動の基準値を10に設定 (±10円の変動)

export function calculateCurrentPrices(
    companies: Company[],
    day: number,
    currentTime: string,
    marketData: DailyStockData[]
): Company[] {
    const dataLength = marketData.length;

    if (dataLength < 2) return companies;

    // --- 市場全体の「方向性」だけを決定する ---
    const startDataIndex = (day - 1) % (dataLength - 1);
    const endDataIndex = (startDataIndex + 1) % dataLength;

    if (endDataIndex === 0) {
        return companies; // データ最終日に達したら変動を停止
    }
    const startPriceFromData = marketData[startDataIndex][DATA_SOURCE_COLUMN_NAME] as number;
    const endPriceFromData = marketData[endDataIndex][DATA_SOURCE_COLUMN_NAME] as number;

    if (isNaN(startPriceFromData) || isNaN(endPriceFromData)) {
        return companies;
    }
    const marketTrend = Math.sign(endPriceFromData - startPriceFromData); // +1:上昇傾向, -1:下降傾向

    // --- 各社の株価を計算 ---
    return companies.map((company) => {
        // 1. 基本となるランダムな変動を生成 (-1 ~ +1の範囲)
        let randomChange = (Math.random() - 0.5) * 2; // -1から+1の間の数値を生成

        // 2. 市場トレンドを少しだけ反映させる（価格変動の方向を完全に決めない）
        // 市場が上昇傾向なら、少しだけプラスになりやすくする
        if (marketTrend !== 0) {
            randomChange += marketTrend * 0.2; // 影響度を調整
        }

        // 3. 最終的な変動額を計算
        // (基本変動値 × ランダムな方向 × 企業の個性)
        const finalChange = Math.round(
            BASE_FLUCTUATION * randomChange * company.volatility
        );
        
        // 前回の価格に変動額を適用
        const newPrice = company.currentPrice + finalChange;

        // 価格が0未満にならないように調整
        const finalPrice = Math.max(1, newPrice); // 最低価格を1円に設定

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