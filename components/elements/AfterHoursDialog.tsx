import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
            <h2 className="text-xl font-semibold mb-4">取引時間外</h2>
            <p>現在は取引時間外です。翌営業日の開始までお待ちください。</p>
        </DialogContent>
    </Dialog>
);

export default AfterHoursDialog;
