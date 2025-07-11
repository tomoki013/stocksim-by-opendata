// 株価シミュレーション用のユーティリティ関数をまとめたファイル
import { Company, DailyStockData } from '../types/stockGame';

// 市場の方向性を決めるためのカラム名（終値を参照）
const DATA_SOURCE_COLUMN_NAME = '終値';

/**
 * 各企業の現在株価を計算する関数
 * @param companies 企業リスト
 * @param day 現在の日数（1日目, 2日目...）
 * @param currentTime 現在時刻（"HH:mm"形式）
 * @param marketDataSources 4つのデータソース
 * @returns 各企業の株価を更新した新しい配列
 */
export function calculateCurrentPrices(
    companies: Company[],
    day: number,
    currentTime: string,
    marketDataSources: DailyStockData[][]
): Company[] {
    // データソースが不足している場合は変動なし
    if (marketDataSources.length < 4) return companies;

    return companies.map((company) => {
        // 該当企業のデータソースを取得
        const marketData = marketDataSources[company.dataSourceIndex];
        const dataLength = marketData.length;

        // データが2日分未満なら変動なし
        if (dataLength < 2) return company;

        // --- データの始値と終値を取得 ---
        const startDataIndex = (day - 1) % (dataLength - 1);
        const endDataIndex = (startDataIndex + 1) % dataLength;

        // データ最終日に達したら変動を停止
        if (endDataIndex === 0) {
            return company;
        }

        const startPriceFromData = marketData[startDataIndex][DATA_SOURCE_COLUMN_NAME] as number;
        const endPriceFromData = marketData[endDataIndex][DATA_SOURCE_COLUMN_NAME] as number;

        // データ不正時は変動なし
        if (isNaN(startPriceFromData) || isNaN(endPriceFromData)) {
            return company;
        }

        // 1日の変動率を計算
        const dailyChangeRate = (endPriceFromData - startPriceFromData) / startPriceFromData;

        // --- 1日の経過時間を計算 ---
        const [currentHours, currentMinutes] = currentTime.split(':').map(Number);
        // 9:00 (開始) から 15:30 (終了) までの総取引時間は390分
        const minutesFromOpen = (currentHours * 60 + currentMinutes) - (9 * 60);
        const totalTradingMinutes = (15 * 60 + 30) - (9 * 60); // 390

        // 1日のうちどれくらいの時間が経過したかの割合 (0.0 〜 1.0)
        const timeFraction = Math.max(0, Math.min(1, minutesFromOpen / totalTradingMinutes));
        
        // --- 線形補間による現在価格の計算 ---
        // その日の始値 (dayStartPrice) を基準に、経過時間に応じた目標価格を計算
        const targetPrice = company.dayStartPrice * (1 + dailyChangeRate * timeFraction);

        // わずかなランダム変動を追加 (+/- 0.5%)
        const randomFactor = 1 + (Math.random() - 0.5) * 0.01;
        const newPrice = Math.round(targetPrice * randomFactor);
        
        // 価格が0未満にならないように調整（最低1円）
        const finalPrice = Math.max(1, newPrice);

        // previousPrice: 前回価格, currentPrice: 今回価格に更新
        return {
            ...company,
            previousPrice: company.currentPrice,
            currentPrice: finalPrice,
        };
    });
}

/**
 * 時刻を15分進める関数
 * @param currentTime 現在時刻（"HH:mm"形式）
 * @returns 新しい時刻と、取引時間外かどうかの判定
 */
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
        isAfterHours: newTimeString === '15:30', // 15:30になったら取引終了
    };
}
