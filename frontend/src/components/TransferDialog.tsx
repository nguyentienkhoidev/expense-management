import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import { X, Loader2, ArrowRightLeft } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface WalletType {
    id: number;
    name: string;
    balance: number;
    isActive: boolean;
}

interface TransferDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function TransferDialog({ isOpen, onClose, onSuccess }: TransferDialogProps) {
    const { t } = useTranslation();
    const { currency, formatCurrency } = usePreferences();
    const [amount, setAmount] = useState('');
    const [fromWalletId, setFromWalletId] = useState<number | ''>('');
    const [toWalletId, setToWalletId] = useState<number | ''>('');
    const [note, setNote] = useState('');
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            axiosClient.get('/wallets').then(res => setWallets(res.data)).catch(console.error);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !fromWalletId || !toWalletId || fromWalletId === toWalletId) return;
        
        setLoading(true);
        try {
            await axiosClient.post('/transfers', {
                amount: parseFloat(amount),
                fromWalletId,
                toWalletId,
                note,
                transferDate: new Date().toISOString().split('T')[0]
            });
            onSuccess();
            onClose();
            setAmount('');
            setFromWalletId('');
            setToWalletId('');
            setNote('');
        } catch (error) {
            console.error("Failed to transfer", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
                    <motion.div initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }} animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }} exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }} className="fixed left-1/2 top-1/2 z-50 w-full max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2"><ArrowRightLeft className="h-5 w-5" /> {t('wallets.transferMoney')}</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full"><X className="h-4 w-4" /></Button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative border-b border-border/50 pb-2">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-muted-foreground font-light">{currency === 'USD' ? '$' : '₫'}</span>
                                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="w-full bg-transparent text-center text-5xl font-light tracking-tight focus:outline-none placeholder:text-muted-foreground/30 py-4" />
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('wallets.sourceWallet')}</label>
                                    <select value={fromWalletId} onChange={(e) => setFromWalletId(Number(e.target.value))} required className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                                        <option value="" disabled>{t('wallets.selectSource')}</option>
                                        {wallets.filter(w => w.isActive !== false).map(w => <option key={w.id} value={w.id} disabled={w.id === toWalletId}>{w.name} ({formatCurrency(w.balance)})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('wallets.destinationWallet')}</label>
                                    <select value={toWalletId} onChange={(e) => setToWalletId(Number(e.target.value))} required className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                                        <option value="" disabled>{t('wallets.selectDestination')}</option>
                                        {wallets.filter(w => w.isActive !== false).map(w => <option key={w.id} value={w.id} disabled={w.id === fromWalletId}>{w.name} ({formatCurrency(w.balance)})</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('transactions.note')}</label>
                                    <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder={t('wallets.transferReason')} className="bg-background/50" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12" disabled={loading || !amount || !fromWalletId || !toWalletId || fromWalletId === toWalletId}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('wallets.confirmTransfer')}
                            </Button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
