import { Company } from '@/types/stockGame';

type Props = {
    cash: number;
    companies: Company[];
};

const PortfolioSummary = ({
    cash,
    companies
}: Props) => {
    const totalStockValue = companies.reduce(
        (sum, company) => sum + company.currentPrice * company.shares,
        0
    );
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card p-4 border-t">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div>現金残高: ¥{cash.toLocaleString()}</div>
                <div>株式評価額: ¥{totalStockValue.toLocaleString()}</div>
                <div>総資産: ¥{(cash + totalStockValue).toLocaleString()}</div>
            </div>
        </div>
    );
};

export default PortfolioSummary;
