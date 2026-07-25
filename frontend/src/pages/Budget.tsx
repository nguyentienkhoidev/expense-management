import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Plus, Coffee, ShoppingBag, Home, Zap, Car, Layers, Trash2, ShoppingCart, Utensils, Plane, Gamepad2, Gift, FileText } from 'lucide-react';
import { BudgetDialog } from '../components/BudgetDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';

const AVAILABLE_ICONS = [
    { key: 'shopping', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'food', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { key: 'transport', icon: Car, color: 'text-gray-500', bg: 'bg-gray-500/10' },
    { key: 'utilities', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { key: 'entertainment', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { key: 'health', icon: Plus, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'home', icon: Home, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { key: 'travel', icon: Plane, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { key: 'gift', icon: Gift, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { key: 'other', icon: FileText, color: 'text-slate-500', bg: 'bg-slate-500/10' },
];

const getBudgetIcon = (budget: any) => {
    if (budget.icon) {
        const found = AVAILABLE_ICONS.find(i => i.key === budget.icon);
        if (found) return { icon: found.icon, color: found.color.replace('text-', 'bg-') };
    }

    const combined = ((budget.name || '') + ' ' + (budget.category?.name || '')).toLowerCase();
    if (combined.includes('food') || combined.includes('dining') || combined.includes('coffee')) return { icon: Coffee, color: 'bg-red-500' };
    if (combined.includes('shop')) return { icon: ShoppingBag, color: 'bg-blue-500' };
    if (combined.includes('hous') || combined.includes('rent')) return { icon: Home, color: 'bg-emerald-500' };
    if (combined.includes('util') || combined.includes('electric')) return { icon: Zap, color: 'bg-orange-500' };
    if (combined.includes('trans') || combined.includes('car')) return { icon: Car, color: 'bg-purple-500' };
    return { icon: Layers, color: 'bg-gray-500' };
};

export default function Budget() {
  const { t } = useTranslation();
  const { formatCurrency } = usePreferences();
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBudgets = async () => {
      try {
          const res = await axiosClient.get('/budgets');
          setBudgets(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  useEffect(() => {
      fetchBudgets();
  }, []);

  const handleDelete = async (id: number) => {
      setIsDeleting(true);
      try {
          await axiosClient.delete(`/budgets/${id}`);
          fetchBudgets();
      } catch (err: any) {
          toast.error(err.response?.data?.error || err.response?.data || t('error'));
      } finally {
          setIsDeleting(false);
          setBudgetToDelete(null);
      }
  };

  return (
    <div className="space-y-6">
      <BudgetDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSuccess={fetchBudgets} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('budget.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('budget.subtitle')}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="rounded-lg shadow-sm gap-2">
            <Plus className="h-4 w-4" /> {t('budget.setBudget')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {budgets.length === 0 && <p className="text-muted-foreground md:col-span-2">{t('budget.noBudgets')}</p>}
        {budgets.map(budget => {
            const percentage = Math.min(Math.round((budget.spent / budget.amount) * 100), 100);
            const isOver = budget.spent > budget.amount;
            const style = getBudgetIcon(budget);
            const Icon = style.icon;

            return (
                <Card key={budget.id} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                        <div className={`p-3 rounded-xl bg-muted/50`}>
                            <Icon className="h-6 w-6 text-foreground" />
                        </div>
                        <div className="flex-1">
                            <CardTitle className="text-lg">{budget.name}</CardTitle>
                            <CardDescription>{formatCurrency(budget.spent)} {t('budget.of')} {formatCurrency(budget.amount)}</CardDescription>
                        </div>
                        {isOver && <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-md">{t('budget.overLimit')}</span>}
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground">{percentage}% {t('budget.used')}</span>
                                <span className={isOver ? 'text-destructive font-medium' : 'font-medium'}>
                                    {formatCurrency(Math.abs(budget.amount - budget.spent))} {isOver ? t('budget.over') : t('budget.left')}
                                </span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                        </div>
                        <Button variant="ghost" size="sm" className="mt-3 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1" onClick={() => setBudgetToDelete(budget.id)}>
                            <Trash2 className="h-3.5 w-3.5" /> {t('delete')}
                        </Button>
                    </CardContent>
                </Card>
            )
        })}
      </div>

      <ConfirmDialog
          isOpen={!!budgetToDelete}
          title={t('delete')}
          description={t('confirm')}
          onConfirm={() => budgetToDelete && handleDelete(budgetToDelete)}
          onCancel={() => setBudgetToDelete(null)}
          isLoading={isDeleting}
      />
    </div>
  );
}
