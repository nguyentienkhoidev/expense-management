import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import { X, Loader2, Wifi, Droplets, Zap, Shield, MonitorPlay, FileText, Home, Car, Smartphone, Coffee, ShoppingCart, Utensils, Plane, Gamepad2, Gift } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Category {
    id: number;
    name: string;
    type: string;
    icon: string;
    color: string;
}

interface BudgetDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const AVAILABLE_ICONS = [
    { key: 'shopping', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'food', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { key: 'transport', icon: Car, color: 'text-gray-500', bg: 'bg-gray-500/10' },
    { key: 'utilities', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { key: 'entertainment', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { key: 'health', icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'home', icon: Home, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { key: 'travel', icon: Plane, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { key: 'gift', icon: Gift, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { key: 'other', icon: FileText, color: 'text-slate-500', bg: 'bg-slate-500/10' },
];

export function BudgetDialog({ isOpen, onClose, onSuccess }: BudgetDialogProps) {
    const { t } = useTranslation();
    const { currency, formatCurrency } = usePreferences();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [period, setPeriod] = useState('MONTHLY');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [selectedIcon, setSelectedIcon] = useState('shopping');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);

    // New category state
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);

    const fetchCategories = async () => {
        try {
            const res = await axiosClient.get('/categories');
            setCategories(res.data.filter((c: any) => c.type === 'EXPENSE'));
            return res.data;
        } catch (error) {
            console.error("Failed to fetch categories", error);
            return [];
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
            setShowNewCategory(false);
            setNewCategoryName('');
        }
    }, [isOpen]);

    const handleCreateCategory = async () => {
        if (!newCategoryName) return;
        setCreatingCategory(true);
        try {
            const res = await axiosClient.post('/categories', {
                name: newCategoryName,
                type: 'EXPENSE',
                color: '#8B5CF6' // Default purple for budget categories
            });
            const newCat = res.data;
            await fetchCategories();
            setCategoryId(newCat.id);
            setShowNewCategory(false);
            setNewCategoryName('');
        } catch (error) {
            console.error("Failed to create category", error);
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !amount || !categoryId) return;
        
        setLoading(true);
        try {
            await axiosClient.post('/budgets', {
                name,
                amount: parseFloat(amount),
                period,
                categoryId,
                icon: selectedIcon
            });
            onSuccess();
            onClose();
            setName('');
            setAmount('');
            setPeriod('MONTHLY');
            setCategoryId('');
            setSelectedIcon('shopping');
        } catch (error) {
            console.error("Failed to create budget", error);
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
                            <h2 className="text-xl font-bold">{t('budget.setBudget')}</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full"><X className="h-4 w-4" /></Button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('budget.budgetName')}</label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Monthly Groceries" required className="bg-background/50" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('budget.limitAmount')}</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currency === 'USD' ? '$' : '₫'}</span>
                                        <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" required className="bg-background/50 pl-8" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase">{t('budget.period')}</label>
                                    <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm">
                                        <option value="MONTHLY">{t('budget.monthly')}</option>
                                        <option value="YEARLY">{t('budget.yearly')}</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase">{t('budget.targetCategory')}</label>
                                        {!showNewCategory && (
                                            <button
                                                type="button"
                                                onClick={() => setShowNewCategory(true)}
                                                className="text-xs font-medium text-primary hover:underline"
                                            >
                                                {t('newCategory')}
                                            </button>
                                        )}
                                    </div>
                                    
                                    {showNewCategory ? (
                                        <div className="p-3 border border-border/50 rounded-xl bg-background/50 space-y-3">
                                            <Input
                                                placeholder={t('budget.targetCategory')}
                                                value={newCategoryName}
                                                onChange={(e) => setNewCategoryName(e.target.value)}
                                                className="h-8 text-sm"
                                                autoFocus
                                            />
                                            <div className="flex gap-2">
                                                <Button type="button" size="sm" variant="secondary" className="h-8 flex-1 text-xs" onClick={() => setShowNewCategory(false)}>
                                                    {t('cancel')}
                                                </Button>
                                                <Button type="button" size="sm" className="h-8 flex-1 text-xs" disabled={!newCategoryName || creatingCategory} onClick={handleCreateCategory}>
                                                    {creatingCategory ? <Loader2 className="h-3 w-3 animate-spin" /> : t('create')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} required className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                                            <option value="" disabled>{t('selectCategory')}</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    )}
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
                            <Button type="submit" className="w-full h-12" disabled={loading || !name || !amount || !categoryId}>
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('budget.saveBudget')}
                            </Button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
