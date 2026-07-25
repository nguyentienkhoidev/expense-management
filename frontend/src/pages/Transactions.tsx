import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import axiosClient from '../api/axiosClient';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Search, Filter, DollarSign, MoreHorizontal, Loader2, Trash } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { format } from 'date-fns';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';

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

export default function Transactions() {
  const { t } = useTranslation();
  const { formatCurrency } = usePreferences();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [serverTotalPages, setServerTotalPages] = useState(1);
  
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]);

  const fetchTransactions = async () => {
    try {
      let url = `/transactions?page=${currentPage - 1}&size=${itemsPerPage}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      if (typeFilter && typeFilter !== 'ALL') url += `&type=${typeFilter}`;
      
      const res = await axiosClient.get(url);
      if (res.data.content !== undefined) {
          setTransactions(res.data.content);
          setServerTotalPages(res.data.totalPages);
      } else {
          setTransactions(res.data);
          setServerTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(true);
    try {
        await axiosClient.delete(`/transactions/${id}`);
        setTransactions(transactions.filter(t => t.id !== id));
    } catch (err: any) {
        toast.error(err.response?.data?.error || err.response?.data || t('auth.failedDeleteTransaction'));
    } finally {
        setIsDeleting(false);
        setTransactionToDelete(null);
    }
  };

  const totalPages = serverTotalPages;
  const paginatedTransactions = transactions;

  // Debounced search and filter
  useEffect(() => {
      const delayDebounceFn = setTimeout(() => {
          if (currentPage === 1) {
              fetchTransactions();
          } else {
              setCurrentPage(1); // this will trigger the other useEffect
          }
      }, 500);
      return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, typeFilter]);

  const handleExportCSV = async () => {
      try {
          const res = await axiosClient.get('/transactions/export', { responseType: 'blob' });
          const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `transactions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
      } catch (err) {
          console.error('Export failed', err);
      }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('transactions.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('transactions.subtitle')}</p>
        </div>
        <Button onClick={handleExportCSV} className="rounded-lg shadow-sm gap-2 w-full sm:w-auto">
            <DollarSign className="h-4 w-4" /> {t('exportCSV')}
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                      placeholder={t('searchTransactions')}
                      className="pl-9 rounded-lg bg-background/50 border-border/50 h-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              <div className="flex gap-4">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="w-[140px] rounded-lg bg-background/50 h-10">
                          <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg">
                          <SelectItem value="ALL">{t('allTypes')}</SelectItem>
                          <SelectItem value="INCOME">{t('income')}</SelectItem>
                          <SelectItem value="EXPENSE">{t('expense')}</SelectItem>
                      </SelectContent>
                  </Select>
                  <Button variant="outline" className="rounded-lg gap-2 px-4 h-10 bg-background/50">
                      <Filter className="h-4 w-4" /> {t('filters')}
                  </Button>
              </div>
          </CardContent>
      </Card>

      {loading ? (
          <div className="py-20 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      ) : transactions.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground bg-card/30 rounded-xl border border-border/50">
              {t('transactions.noTransactions')}
          </div>
      ) : (
          <>
            {/* Desktop Table (Hidden on Mobile) */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm hidden md:block overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border/50">
                            <tr>
                                <th className="px-6 py-4 font-medium">{t('transactions.type')}</th>
                                <th className="px-6 py-4 font-medium">{t('transactions.wallet')}</th>
                                <th className="px-6 py-4 font-medium">{t('transactions.date')}</th>
                                <th className="px-6 py-4 font-medium text-right">{t('transactions.amount')}</th>
                                <th className="px-6 py-4 font-medium"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedTransactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: tx.category.color }}>
                                                <span className="font-bold text-sm">{tx.category.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <div className="font-medium">{tx.note || tx.category.name}</div>
                                                <div className="text-xs text-muted-foreground">{tx.category.name}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-secondary/20 text-secondary-foreground border border-border/50">
                                            {tx.wallet.name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{format(new Date(tx.transactionDate), 'MMM dd, yyyy')}</td>
                                    <td className={`px-6 py-4 text-right font-medium text-base ${tx.category.type === 'INCOME' ? 'text-primary' : 'text-foreground'}`}>
                                        {tx.category.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-lg">
                                                <DropdownMenuItem onClick={() => setTransactionToDelete(tx.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                                                    <Trash className="h-4 w-4 mr-2" /> {t('delete')}
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Mobile Card Layout (Hidden on Desktop) */}
            <div className="md:hidden space-y-3">
                {paginatedTransactions.map((tx) => (
                    <Card key={tx.id} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: tx.category.color }}>
                                    <span className="font-bold text-sm">{tx.category.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-sm leading-tight">{tx.note || tx.category.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{tx.category.name} • {format(new Date(tx.transactionDate), 'MMM dd')}</p>
                                </div>
                            </div>
                            <div className={`font-semibold text-sm ${tx.category.type === 'INCOME' ? 'text-primary' : 'text-foreground'}`}>
                                {tx.category.type === 'INCOME' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-4">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        {t('previous')}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {currentPage} / {totalPages}
                    </span>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                    >
                        {t('next')}
                    </Button>
                </div>
            )}
            
            <ConfirmDialog 
                isOpen={!!transactionToDelete}
                title={t('delete')}
                description={t('transactions.confirmDelete')}
                onConfirm={() => transactionToDelete && handleDelete(transactionToDelete)}
                onCancel={() => setTransactionToDelete(null)}
                isLoading={isDeleting}
            />
          </>
      )}
    </div>
  );
}
