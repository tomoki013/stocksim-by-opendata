import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Company } from '@/types/stockGame';
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from 'lucide-react';

type Props = {
    company: Company;
    onBuy: () => void;
    onSell: () => void;
    isStarted: boolean;
    isAfterHours: boolean;
};

const getPriceIndicator = (company: Company) => {
    if (company.currentPrice > company.previousPrice) {
        return <ArrowUpIcon className="text-green-500" />;
    }
    if (company.currentPrice < company.previousPrice) {
        return <ArrowDownIcon className="text-red-800" />;
    }
    return <ArrowRightIcon className="text-gray-500" />;
};

const CompanyCard = ({
    company,
    onBuy,
    onSell,
    isStarted,
    isAfterHours
}: Props) => (
    <Card>
        <CardHeader className="bg-muted">
            <div className="font-semibold">{company.name}</div>
        </CardHeader>
        <CardContent className="p-4">
            <div className="mb-4">
                <div>保有株数: {company.shares.toLocaleString()}株</div>
                <div>評価額: ¥{(company.currentPrice * company.shares).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
                <Button onClick={onBuy} disabled={!isStarted || isAfterHours} className='bg-green-500 hover:bg-green-400 cursor-pointer'>購入</Button>
                <Button onClick={onSell} disabled={!isStarted || isAfterHours || company.shares === 0} className='bg-red-500 hover:bg-red-400 cursor-pointer'>売却</Button>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <span className="text-orange-500">¥{company.currentPrice.toLocaleString()}</span>
                <span>{getPriceIndicator(company)}</span>
            </div>
        </CardContent>
    </Card>
);

export default CompanyCard;
