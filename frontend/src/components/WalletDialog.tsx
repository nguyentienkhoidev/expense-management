import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import { X, Loader2, Building2, Wallet, CreditCard, Smartphone, PiggyBank, Landmark, CircleDollarSign, Coins, Gem, Bitcoin } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface WalletDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    walletToEdit?: { id: number; name: string; type: string; balance: number; } | null;
}

const WALLET_TYPES = [
    { id: 'Bank', nameKey: 'wallets.types.bank', icon: Building2 },
    { id: 'Cash', nameKey: 'wallets.types.cash', icon: Wallet },
    { id: 'Credit Card', nameKey: 'wallets.types.credit', icon: CreditCard },
    { id: 'E-wallet', nameKey: 'wallets.types.ewallet', icon: Smartphone }
];

const AVAILABLE_ICONS = [
    { key: 'bank', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'wallet', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'credit', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { key: 'smartphone', icon: Smartphone, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { key: 'piggy', icon: PiggyBank, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { key: 'landmark', icon: Landmark, color: 'text-slate-500', bg: 'bg-slate-500/10' },
    { key: 'dollar', icon: CircleDollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { key: 'coins', icon: Coins, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { key: 'gem', icon: Gem, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { key: 'bitcoin', icon: Bitcoin, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

export function WalletDialog({ isOpen, onClose, onSuccess, walletToEdit }: WalletDialogProps) {
    const { t } = useTranslation();
    const { currency, formatCurrency } = usePreferences();
    const [name, setName] = useState('');
    const [type, setType] = useState('Bank');
    const [balance, setBalance] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('bank');
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        if (isOpen) {
            if (walletToEdit) {
                setName(walletToEdit.name);
                setType(walletToEdit.type);
                setBalance(walletToEdit.balance.toString());
                // In a real app we'd get icon from walletToEdit, but for now fallback to bank if missing
                setSelectedIcon((walletToEdit as any).icon || 'bank');
            } else {
                setName('');
                setType('Bank');
                setBalance('');
                setSelectedIcon('bank');
            }
        }
    }, [isOpen, walletToEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !balance) return;
        
        setLoading(true);
        try {
            if (walletToEdit) {
                await axiosClient.put(`/wallets/${walletToEdit.id}`, {
                    name,
                    type,
                    balance: parseFloat(balance),
                    icon: selectedIcon
                });
            } else {
                await axiosClient.post('/wallets', {
                    name,
                    type,
                    balance: parseFloat(balance),
                    icon: selectedIcon
                });
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to create wallet", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }} 
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }} 
                        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }} 
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold">{walletToEdit ? t('edit') : t('wallets.addWallet')}</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('wallets.walletName')}</label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Main Checking" required className="bg-background/50" />
                                </div>
                                
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('wallets.initialBalance')}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currency === 'USD' ? '$' : '₫'}</span>
                                        <Input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="0.00" required className="bg-background/50 pl-8" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('wallets.walletType')}</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {WALLET_TYPES.map(wt => (
                                            <button
                                                key={wt.id}
                                                type="button"
                                                onClick={() => setType(wt.id)}
                                                className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${type === wt.id ? 'border-primary bg-primary/10 font-medium' : 'border-border/50 bg-background/50 hover:bg-muted'}`}
                                            >
                                                <wt.icon className="h-4 w-4" /> {t(wt.nameKey)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('Icon')}</label>
                                    <div className="grid grid-cols-5 gap-2">
                                        {AVAILABLE_ICONS.map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <button
                                                    key={item.key}
                                                    type="button"
                                                    onClick={() => setSelectedIcon(item.key)}
                                                    className={`p-2 rounded-xl flex justify-center items-center transition-all ${selectedIcon === item.key ? `ring-2 ring-primary ${item.bg}` : 'bg-background/50 hover:bg-muted'}`}
                                                >
                                                    <Icon className={`h-5 w-5 ${selectedIcon === item.key ? item.color : 'text-muted-foreground'}`} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-12" disabled={loading || !name || !balance}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (walletToEdit ? t('save') : t('wallets.addWallet'))}
                            </Button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
