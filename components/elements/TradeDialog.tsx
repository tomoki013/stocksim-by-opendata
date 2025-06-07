import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Company } from '@/types/stockGame';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    company: Company | null;
    isBuying: boolean;
    tradeAmount: string;
    onTradeAmountChange: (v: string) => void;
    onTrade: () => void;
    errorMessage: string | null;
    cash: number;
};

const TradeDialog = ({
    open,
    onOpenChange,
    company,
    isBuying,
    tradeAmount,
    onTradeAmountChange,
    onTrade,
    errorMessage,
    cash,
}: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {company?.name}の株式{isBuying ? '購入' : '売却'}
                </DialogTitle>
            </DialogHeader>
            <div className="py-4">
                {errorMessage && <div className="mb-4 text-red-500 font-semibold">{errorMessage}</div>}
                <div className="mb-4">
                    <div>現在の株価: ¥{company?.currentPrice.toLocaleString()}</div>
                    {isBuying ? (
                        <div>現在の現金残高: ¥{cash.toLocaleString()}</div>
                    ) : (
                        <div>保有株数: {company?.shares.toLocaleString()}株</div>
                    )}
                </div>
                <Input
                    type="number"
                    placeholder="株数を入力"
                    value={tradeAmount}
                    onChange={e => onTradeAmountChange(e.target.value)}
                    min="1"
                    max={isBuying ? Math.floor(cash / (company?.currentPrice || 1)) : company?.shares}
                    onKeyDown={e => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            onTrade();
                        }
                    }}
                />
                {tradeAmount && company && (
                    <div className="mt-2">取引金額: ¥{(parseInt(tradeAmount) * company.currentPrice).toLocaleString()}</div>
                )}
            </div>
            <DialogFooter>
                <Button
                    onClick={onTrade}
                    className='cursor-pointer'
                >
                    確定
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
);

export default TradeDialog;
