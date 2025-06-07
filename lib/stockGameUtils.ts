// 株価シミュレーション用のユーティリティ関数をまとめたファイル
import { Company, DailyStockData } from '../types/stockGame';

// 市場の方向性を決めるためのカラム名（終値を参照）
const DATA_SOURCE_COLUMN_NAME = '終値';
// 株価変動の基準値（±10円の変動を想定）
const BASE_FLUCTUATION = 10;

/**
 * 各企業の現在株価を計算する関数
 * @param companies 企業リスト
 * @param day 現在の日数（1日目, 2日目...）
 * @param currentTime 現在時刻（"HH:mm"形式）
 * @param marketData 日ごとの株価データ
 * @returns 各企業の株価を更新した新しい配列
 */
export function calculateCurrentPrices(
    companies: Company[],
    day: number,
    currentTime: string,
    marketData: DailyStockData[]
): Company[] {
    const dataLength = marketData.length;

    // データが2日分未満なら変動なし
    if (dataLength < 2) return companies;

    // --- 市場全体の「方向性」（トレンド）を決定 ---
    // 前日と当日の終値を比較し、上昇(+1)/下降(-1)/横ばい(0)を判定
    const startDataIndex = (day - 1) % (dataLength - 1);
    const endDataIndex = (startDataIndex + 1) % dataLength;

    // データ最終日に達したら変動を停止
    if (endDataIndex === 0) {
        return companies;
    }
    const startPriceFromData = marketData[startDataIndex][DATA_SOURCE_COLUMN_NAME] as number;
    const endPriceFromData = marketData[endDataIndex][DATA_SOURCE_COLUMN_NAME] as number;

    // データ不正時は変動なし
    if (isNaN(startPriceFromData) || isNaN(endPriceFromData)) {
        return companies;
    }
    // +1:上昇, -1:下降, 0:横ばい
    const marketTrend = Math.sign(endPriceFromData - startPriceFromData);

    // --- 各社の株価を計算 ---
    return companies.map((company) => {
        // 1. 基本となるランダムな変動を生成 (-1 ~ +1の範囲)
        let randomChange = (Math.random() - 0.5) * 2;

        // 2. 市場トレンドを少しだけ反映させる（価格変動の方向を完全に決めない）
        // 市場が上昇傾向なら、少しだけプラスになりやすくする
        if (marketTrend !== 0) {
            randomChange += marketTrend * 0.2; // トレンドの影響度を調整
        }

        // 3. 最終的な変動額を計算
        // (基準値 × ランダムな方向 × 企業のボラティリティ)
        const finalChange = Math.round(
            BASE_FLUCTUATION * randomChange * company.volatility
        );
        
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