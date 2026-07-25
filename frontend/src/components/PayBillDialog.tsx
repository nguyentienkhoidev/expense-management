import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, ArrowRightLeft } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { usePreferences } from '../context/PreferencesContext';
import { toast } from 'sonner';

interface PayBillDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    bill: any;
}

export function PayBillDialog({ isOpen, onClose, onSuccess, bill }: PayBillDialogProps) {
    const { t } = useTranslation();
    const { formatCurrency } = usePreferences();
    const [wallets, setWallets] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [selectedWallet, setSelectedWallet] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        } else {
            setSelectedWallet('');
            setSelectedCategory('');
        }
    }, [isOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [walletsRes, categoriesRes] = await Promise.all([
                axiosClient.get('/wallets'),
                axiosClient.get('/categories')
            ]);
            setWallets(walletsRes.data);
            const expenseCategories = categoriesRes.data.filter((c: any) => c.type === 'EXPENSE');
            setCategories(expenseCategories);
            
            if (walletsRes.data.length > 0) {
                setSelectedWallet(walletsRes.data[0].id.toString());
            }
            if (expenseCategories.length > 0) {
                // Try to find a default "Bills" category
                const billsCat = expenseCategories.find((c: any) => c.name.toLowerCase().includes('bill'));
                setSelectedCategory(billsCat ? billsCat.id.toString() : expenseCategories[0].id.toString());
            }
        } catch (err) {
            console.error('Failed to fetch form data', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePay = async () => {
        if (!selectedWallet || !selectedCategory || !bill) return;
        setIsSubmitting(true);
        try {
            await axiosClient.post(`/bills/${bill.id}/pay`, {
                walletId: parseInt(selectedWallet),
                categoryId: parseInt(selectedCategory)
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.error || err.response?.data || t('error'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{t('bills.payBill')}</DialogTitle>
                    <DialogDescription>
                        {t('bills.confirmPay')} {bill?.name}
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid gap-6 py-4">
                        <div className="flex flex-col items-center justify-center p-4 bg-muted/50 rounded-xl mb-2">
                            <span className="text-sm text-muted-foreground">{t('bills.amountToPay')}</span>
                            <span className="text-2xl font-bold">{bill ? formatCurrency(bill.amount) : ''}</span>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="wallet" className="text-sm font-medium">{t('transactions.wallet')}</label>
                            <select
                                id="wallet"
                                value={selectedWallet}
                                onChange={(e) => setSelectedWallet(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                            >
                                <option value="" disabled>{t('selectWallet')}</option>
                                {wallets.filter(w => w.isActive !== false).map((wallet) => (
                                    <option key={wallet.id} value={wallet.id}>
                                        {wallet.name} ({formatCurrency(wallet.balance)})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label htmlFor="category" className="text-sm font-medium">{t('transactions.category')}</label>
                            <select
                                id="category"
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                            >
                                <option value="" disabled>{t('selectCategory')}</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>{t('cancel')}</Button>
                    <Button onClick={handlePay} disabled={isSubmitting || !selectedWallet || !selectedCategory}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {t('bills.payNow')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
