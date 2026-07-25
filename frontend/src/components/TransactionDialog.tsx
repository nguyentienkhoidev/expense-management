import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import { X, Loader2, Wallet, Tag, FileText, Plus, Trash2 } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ConfirmDialog } from './ConfirmDialog';
import { toast } from 'sonner';

interface Category {
    id: number;
    name: string;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    icon: string;
    color: string;
    isDefault: boolean;
}

interface WalletType {
    id: number;
    name: string;
    balance: number;
    isActive: boolean;
}

interface TransactionDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function TransactionDialog({ isOpen, onClose, onSuccess }: TransactionDialogProps) {
    const { t } = useTranslation();
    const { currency, formatCurrency } = usePreferences();
    const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [walletId, setWalletId] = useState<number | ''>('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    
    const [categories, setCategories] = useState<Category[]>([]);
    const [wallets, setWallets] = useState<WalletType[]>([]);
    const [loading, setLoading] = useState(false);
    
    // New category state
    const [showNewCategory, setShowNewCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);
    
    const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
    const [deletingCategory, setDeletingCategory] = useState(false);
    
    // Fetch data when dialog opens
    const fetchCategories = async () => {
        try {
            const res = await axiosClient.get('/categories');
            setCategories(res.data);
            return res.data;
        } catch (error) {
            console.error("Failed to fetch categories", error);
            return [];
        }
    };

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const walRes = await axiosClient.get('/wallets');
                    setWallets(walRes.data);
                    await fetchCategories();
                    
                    // Auto-select first wallet if available
                    if (walRes.data.length > 0 && !walletId) {
                        setWalletId(walRes.data[0].id);
                    }
                } catch (error) {
                    console.error("Failed to fetch form data", error);
                }
            };
            fetchData();
        }
    }, [isOpen]);

    // Reset form when closed
    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setNote('');
            setType('EXPENSE');
            setCategoryId('');
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
                type: type,
                color: '#3B82F6' // default blue
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

    const handleDeleteCategory = async (id: number) => {
        setDeletingCategory(true);
        try {
            await axiosClient.delete(`/categories/${id}`);
            if (categoryId === id) setCategoryId('');
            await fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.error || error.response?.data || t('auth.failedDeleteCategory'));
        } finally {
            setDeletingCategory(false);
            setCategoryToDelete(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || !walletId || !categoryId) return;
        
        setLoading(true);
        try {
            await axiosClient.post('/transactions', {
                amount: parseFloat(amount),
                walletId,
                categoryId,
                note,
                transactionDate: new Date().toISOString().split('T')[0]
            });
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Failed to submit transaction", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed left-1/2 top-1/2 z-50 w-full max-w-md overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold tracking-tight">{t('transactions.newTransaction')}</h2>
                            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                                <X className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Type Toggle */}
                            <div className="flex p-1 bg-muted/50 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setType('EXPENSE')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'EXPENSE' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {t('expense')}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('INCOME')}
                                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${type === 'INCOME' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {t('income')}
                                </button>
                            </div>

                            {/* Amount */}
                            <div className="relative border-b border-border/50 pb-2">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl text-muted-foreground font-light">{currency === 'USD' ? '$' : '₫'}</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                    className="w-full bg-transparent text-center text-5xl font-light tracking-tight focus:outline-none placeholder:text-muted-foreground/30 py-4"
                                />
                            </div>

                            <div className="space-y-4">
                                {/* Wallet Selector */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Wallet className="h-3.5 w-3.5" /> {t('transactions.wallet')}
                                    </label>
                                    <select
                                        value={walletId}
                                        onChange={(e) => setWalletId(Number(e.target.value))}
                                        required
                                        className="w-full h-10 px-3 rounded-lg border border-border bg-background/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                                    >
                                        <option value="" disabled>{t('selectWallet')}</option>
                                        {wallets.filter(w => w.isActive !== false).map(w => (
                                            <option key={w.id} value={w.id}>{w.name} ({formatCurrency(w.balance)})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category Selector */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                            <Tag className="h-3.5 w-3.5" /> {t('transactions.category')}
                                        </label>
                                        {!showNewCategory && (
                                            <button
                                                type="button"
                                                onClick={() => setShowNewCategory(true)}
                                                className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
                                            >
                                                <Plus className="h-3 w-3" /> New
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
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-8 flex-1 text-xs"
                                                    onClick={() => setShowNewCategory(false)}
                                                >
                                                    {t('cancel')}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    className="h-8 flex-1 text-xs"
                                                    disabled={!newCategoryName || creatingCategory}
                                                    onClick={handleCreateCategory}
                                                >
                                                    {creatingCategory ? <Loader2 className="h-3 w-3 animate-spin" /> : t('create')}
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-3 gap-2">
                                            {filteredCategories.map(cat => (
                                                <button
                                                    key={cat.id}
                                                    type="button"
                                                    onClick={() => setCategoryId(cat.id)}
                                                    className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${categoryId === cat.id ? 'border-primary bg-primary/10' : 'border-border/50 bg-background/50 hover:bg-muted'}`}
                                                >
                                                    {!cat.isDefault && (
                                                        <button
                                                            type="button"
                                                            className="absolute top-1 right-1 p-1 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setCategoryToDelete(cat.id);
                                                            }}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: cat.color }}>
                                                        <span className="text-xs font-bold">{cat.name.charAt(0)}</span>
                                                    </div>
                                                    <span className="text-[10px] font-medium text-center leading-tight truncate w-full px-1">{cat.name}</span>
                                                </button>
                                            ))}
                                            {filteredCategories.length === 0 && (
                                                <div className="col-span-3 text-sm text-muted-foreground text-center py-4 bg-background/50 rounded-lg border border-border/50">
                                                    {t('noData')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Note */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5" /> {t('transactions.note')}
                                    </label>
                                    <Input
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="What was this for?"
                                        className="bg-background/50"
                                    />
                                </div>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 text-base font-medium"
                                disabled={loading || !amount || !walletId || !categoryId}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : t('save')}
                            </Button>
                        </form>
                    </motion.div>
                    
                    <ConfirmDialog 
                        isOpen={!!categoryToDelete}
                        title={t('delete')}
                        description={t('wallets.confirmDelete')} // Reusing a confirm delete message or a new one
                        onConfirm={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
                        onCancel={() => setCategoryToDelete(null)}
                        isLoading={deletingCategory}
                    />
                </>
            )}
        </AnimatePresence>
    );
}
