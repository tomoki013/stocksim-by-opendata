import { DailyStockData } from '@/types/stockGame';

export const parseStockData = (csvString: string): DailyStockData[] => {
    // 最終行の注釈を削除
    const lines = csvString.trim().split('\n').filter(line => !line.startsWith('本資料は'));
    const header = lines[0].split(',');
    const data: DailyStockData[] = [];

    for (let i = 1; i < lines.length; i++) {
        // ダブルクォートを削除
        const values = lines[i].replace(/"/g, '').split(',');
        const entry: DailyStockData = { Date: values[0] };
        for (let j = 1; j < header.length; j++) {
            // "終値" カラムのみを数値としてパース
            if (header[j] === '終値') {
                entry[header[j]] = parseFloat(values[j]);
            }
        }
        // "終値" が存在する行のみを追加
        if (entry['終値']) {
            data.push(entry);
        }
    }
    return data;
};

// 複数のCSVファイルを一括でパースする関数
export const parseMultipleStockData = (csvStrings: string[]): DailyStockData[][] => {
    return csvStrings.map(csvString => parseStockData(csvString));
};
