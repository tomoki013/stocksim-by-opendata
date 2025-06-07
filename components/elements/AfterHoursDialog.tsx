import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

const AfterHoursDialog = ({
    open,
    onOpenChange
}: Props) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogTitle className="text-xl font-semibold mb-4">取引時間外</DialogTitle>
            <p>現在は取引時間外です。翌営業日の開始までお待ちください。</p>
        </DialogContent>
    </Dialog>
);

export default AfterHoursDialog;
