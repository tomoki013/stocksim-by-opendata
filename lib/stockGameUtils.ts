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

        // --- 企業固有の「方向性」（トレンド）を決定 ---
        // 前日と当日の終値を比較し、上昇(+1)/下降(-1)/横ばい(0)を判定
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

        // 実際のデータに基づく変動率を計算
        const dataChangeRate = (endPriceFromData - startPriceFromData) / startPriceFromData;
        
        // ランダム変動を廃止し、データの変動率のみを利用
        // 変動額 = 現在価格 × データ変動率 × 3（変動幅を3倍に拡大）
        const finalChange = Math.round(company.currentPrice * dataChangeRate * 3);
        
        // 前回の価格に変動額を適用
        const newPrice = company.currentPrice + finalChange;

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
