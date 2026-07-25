import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Plus, Target, PiggyBank, Briefcase, Car, Home, TrendingUp, Trash2, Trophy, Heart, MonitorPlay as Monitor, FileText as File, Wifi as Plane } from 'lucide-react';
import { GoalDialog } from '../components/GoalDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';

const AVAILABLE_ICONS = [
    { key: 'target', icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'trophy', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { key: 'trending', icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'piggy', icon: PiggyBank, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { key: 'heart', icon: Heart, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { key: 'home', icon: Home, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { key: 'car', icon: Car, color: 'text-gray-500', bg: 'bg-gray-500/10' },
    { key: 'plane', icon: Plane, color: 'text-cyan-500', bg: 'bg-cyan-500/10' }, 
    { key: 'monitor', icon: Monitor, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { key: 'file', icon: File, color: 'text-purple-500', bg: 'bg-purple-500/10' },
];

const getGoalIcon = (goal: any) => {
    if (goal.icon) {
        const found = AVAILABLE_ICONS.find(i => i.key === goal.icon);
        if (found) return { icon: found.icon, bgClass: found.bg };
    }
    
    // Fallback logic
    const n = (goal.name || '').toLowerCase();
    let icon = Target;
    if (n.includes('car') || n.includes('vehicle')) icon = Car;
    else if (n.includes('house') || n.includes('home')) icon = Home;
    else if (n.includes('fund') || n.includes('save') || n.includes('emergency')) icon = PiggyBank;

    const bgClass = goal.color.replace('text-', 'bg-') + '/10';
    return { icon, bgClass };
};

export default function Goals() {
  const { t } = useTranslation();
  const { formatCurrency } = usePreferences();
  const [goals, setGoals] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchGoals = async () => {
      try {
          const res = await axiosClient.get('/goals');
          setGoals(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  useEffect(() => {
      fetchGoals();
  }, []);

  const handleDelete = async (id: number) => {
      setIsDeleting(true);
      try {
          await axiosClient.delete(`/goals/${id}`);
          fetchGoals();
      } catch (err: any) {
          toast.error(err.response?.data?.error || err.response?.data || t('error'));
      } finally {
          setIsDeleting(false);
          setGoalToDelete(null);
      }
  };

  return (
    <div className="space-y-6">
      <GoalDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSuccess={fetchGoals} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('goals.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('goals.subtitle')}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="rounded-lg shadow-sm gap-2">
            <Plus className="h-4 w-4" /> {t('goals.createGoal')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.length === 0 && <p className="text-muted-foreground md:col-span-2">{t('goals.noGoals')}</p>}
        {goals.map(goal => {
            const percentage = Math.round((goal.currentAmount / goal.targetAmount) * 100);
            const style = getGoalIcon(goal);
            const Icon = style.icon;

            return (
                <Card key={goal.id} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-4">
                        <div className={`p-3 rounded-xl ${style.bgClass}`}>
                            <Icon className={`h-6 w-6 ${goal.color}`} />
                        </div>
                        <div>
                            <CardTitle className="text-lg">{goal.name}</CardTitle>
                            <CardDescription>{t('goals.target')}: {formatCurrency(goal.targetAmount)}</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{formatCurrency(goal.currentAmount)}</span>
                                <span className="text-muted-foreground">{percentage}%</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                            {goal.targetDate && (
                                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                                    <TrendingUp className="h-3 w-3" /> {t('goals.targetDate')}: {goal.targetDate}
                                </p>
                            )}
                        </div>
                        <Button variant="ghost" size="sm" className="mt-3 text-destructive hover:text-destructive hover:bg-destructive/10 gap-1" onClick={(e) => { e.stopPropagation(); setGoalToDelete(goal.id); }}>
                            <Trash2 className="h-3.5 w-3.5" /> {t('delete')}
                        </Button>
                    </CardContent>
                </Card>
            )
        })}
      </div>

      <ConfirmDialog
          isOpen={!!goalToDelete}
          title={t('delete')}
          description={t('confirm')}
          onConfirm={() => goalToDelete && handleDelete(goalToDelete)}
          onCancel={() => setGoalToDelete(null)}
          isLoading={isDeleting}
      />
    </div>
  );
}
