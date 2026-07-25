import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Loader2 } from 'lucide-react';

export default function Analytics() {
    const { t } = useTranslation();
    const [cashflow, setCashflow] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axiosClient.get('/analytics/cashflow?months=12');
                setCashflow(res.data);
            } catch (error) {
                console.error("Failed to fetch analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="h-[50vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('analytics.title')}</h1>
                    <p className="text-muted-foreground mt-1">{t('analytics.subtitle')}</p>
                </div>
            </div>

            <div className="grid gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('analytics.yearlyIncomeExpense')}</CardTitle>
                        <CardDescription>{t('analytics.yearlyDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[400px] w-full mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={cashflow} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        cursor={{fill: 'hsl(var(--muted)/0.5)'}}
                                    />
                                    <Legend />
                                    <Bar dataKey="income" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} name={t('analytics.income')} />
                                    <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name={t('analytics.expense')} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
