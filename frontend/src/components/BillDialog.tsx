import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import { X, Loader2, Wifi, Droplets, Zap, Shield, MonitorPlay, FileText, Home, Car, Smartphone, Coffee } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface BillDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AVAILABLE_ICONS = [
    { key: 'wifi', icon: Wifi, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'droplets', icon: Droplets, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { key: 'zap', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { key: 'shield', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'monitor', icon: MonitorPlay, color: 'text-red-500', bg: 'bg-red-500/10' },
    { key: 'home', icon: Home, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { key: 'car', icon: Car, color: 'text-gray-500', bg: 'bg-gray-500/10' },
    { key: 'phone', icon: Smartphone, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { key: 'coffee', icon: Coffee, color: 'text-amber-700', bg: 'bg-amber-700/10' },
    { key: 'file', icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

export function BillDialog({ isOpen, onClose, onSuccess }: BillDialogProps) {
    const { t } = useTranslation();
    const { currency, formatCurrency } = usePreferences();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [frequency, setFrequency] = useState('MONTHLY');
    const [selectedIcon, setSelectedIcon] = useState('file');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount) return;
        
        setLoading(true);
        try {
            await axiosClient.post('/bills', {
                name,
                amount: parseFloat(amount),
                dueDate: dueDate || null,
                frequency,
                icon: selectedIcon
            });
            onSuccess();
            onClose();
            setName('');
            setAmount('');
            setDueDate('');
            setFrequency('MONTHLY');
            setSelectedIcon('file');
        } catch (error) {
            console.error("Failed to create bill", error);
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
                            <h2 className="text-xl font-bold">{t('bills.addBill')}</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full"><X className="h-4 w-4" /></Button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('bills.billName')}</label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Internet, Electricity" required className="bg-background/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('transactions.amount')}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currency === 'USD' ? '$' : '₫'}</span>
                                        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="bg-background/50 pl-8" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('bills.dueDate')}</label>
                                    <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-background/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('bills.frequency')}</label>
                                    <select value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm">
                                        <option value="MONTHLY">{t('budget.monthly')}</option>
                                        <option value="YEARLY">{t('budget.yearly')}</option>
                                        <option value="ONE_TIME">{t('bills.oneTime')}</option>
                                    </select>
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
                            <Button type="submit" className="w-full h-12" disabled={loading || !name || !amount}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('bills.saveBill')}
                            </Button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
