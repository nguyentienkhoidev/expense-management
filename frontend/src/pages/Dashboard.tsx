import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { ArrowUpRight, ArrowDownRight, Wallet, PiggyBank, Target, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Calendar } from '../components/ui/calendar';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Transaction {
    id: number;
    amount: number;
    note: string;
    transactionDate: string;
    wallet: { id: number; name: string };
    category: {
        id: number;
        name: string;
        type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
        color: string;
    };
}

interface WalletType {
    id: number;
    balance: number;
}


export default function Dashboard() {
  const { t } = useTranslation();
  const { formatCurrency, currency } = usePreferences();
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [cashflow, setCashflow] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [txRes, walletRes, cashflowRes] = await Promise.all([
          axiosClient.get('/transactions?size=500'),
          axiosClient.get('/wallets'),
          axiosClient.get('/analytics/cashflow')
      ]);
      setTransactions(txRes.data.content || txRes.data);
      setWallets(walletRes.data);
      setCashflow(cashflowRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  // Filter transactions for current month only
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthTxs = transactions.filter(t => {
      const d = new Date(t.transactionDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const totalIncome = currentMonthTxs.filter(t => t.category.type === 'INCOME').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = currentMonthTxs.filter(t => t.category.type === 'EXPENSE').reduce((acc, t) => acc + t.amount, 0);

  // Group by category for pie chart
  const expensesByCategory = transactions
      .filter(t => t.category.type === 'EXPENSE')
      .reduce((acc: any, t) => {
          if (!acc[t.category.name]) {
              acc[t.category.name] = { name: t.category.name, value: 0, color: t.category.color };
          }
          acc[t.category.name].value += Math.abs(t.amount);
          return acc;
      }, {});
  const categoryData = Object.values(expensesByCategory);

  const recentTransactions = transactions.slice(0, 4);

  if (loading) {
      return <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || 'U'}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet className="h-16 w-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalBalance')}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalBalance)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowUpRight className="h-16 w-16 text-primary" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.monthlyIncome')}</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ArrowDownRight className="h-16 w-16 text-destructive" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.monthlyExpense')}</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{formatCurrency(Math.abs(totalExpense))}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <PiggyBank className="h-16 w-16 text-blue-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.totalSavings')}</CardTitle>
            <PiggyBank className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{formatCurrency(totalIncome - Math.abs(totalExpense))}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Main Chart */}
        <Card className="md:col-span-4 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>{t('dashboard.cashFlow')}</CardTitle>
            <CardDescription>{t('dashboard.cashFlowDesc')}</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={cashflow} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(142 71% 45%)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(142 71% 45%)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => currency === 'USD' ? `$${value}` : `${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area type="monotone" dataKey="income" stroke="hsl(142 71% 45%)" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                  <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card className="md:col-span-3 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>{t('dashboard.spendingByCategory')}</CardTitle>
            <CardDescription>{t('dashboard.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
                <>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {categoryData.map((entry: any, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number) => formatCurrency(value)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-4">
                        {categoryData.map((cat: any) => (
                            <div key={cat.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-sm font-medium truncate">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    {t('dashboard.noExpenseData')}
                </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Transactions */}
        <Card className="md:col-span-2 bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>{t('dashboard.recentTransactions')}</CardTitle>
                <CardDescription>{t('transactions.subtitle')}</CardDescription>
            </div>
            <Link to="/transactions">
                <Button variant="outline" size="sm" className="rounded-lg">{t('dashboard.viewAll')}</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: tx.category.color }}>
                          <span className="font-bold text-sm">{tx.category.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{tx.note || tx.category.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{tx.category.name} • {format(new Date(tx.transactionDate), 'MMM dd')}</p>
                        </div>
                      </div>
                      <div className={`font-medium ${tx.category.type === 'INCOME' ? 'text-primary' : 'text-foreground'}`}>
                        {tx.category.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                      </div>
                    </div>
                  ))}
                </div>
            ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                    {t('dashboard.noTransactions')}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Goals & Calendar */}
        <div className="space-y-6">
            <Card className="bg-transparent border-none shadow-none">
                <CardContent className="p-0">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-xl border border-border/50 shadow-sm bg-card/40 backdrop-blur-sm"
                    />
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
