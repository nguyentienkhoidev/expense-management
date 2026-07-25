import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import axiosClient from '../api/axiosClient';
import { Card, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Wifi, Droplets, Zap, Shield, MonitorPlay, FileText, Loader2, Trash2 } from 'lucide-react';
import { BillDialog } from '../components/BillDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PayBillDialog } from '../components/PayBillDialog';
import { toast } from 'sonner';

import { Home, Car, Smartphone, Coffee } from 'lucide-react';

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

const getBillIcon = (bill: any) => {
    // If bill has an explicit icon set
    if (bill.icon) {
        const found = AVAILABLE_ICONS.find(i => i.key === bill.icon);
        if (found) return found;
    }
    
    // Fallback logic for old bills
    const n = (bill.name || '').toLowerCase();
    if (n.includes('internet') || n.includes('wifi')) return AVAILABLE_ICONS[0];
    if (n.includes('water')) return AVAILABLE_ICONS[1];
    if (n.includes('electric') || n.includes('power')) return AVAILABLE_ICONS[2];
    if (n.includes('insurance')) return AVAILABLE_ICONS[3];
    if (n.includes('netflix') || n.includes('tv') || n.includes('movie')) return AVAILABLE_ICONS[4];
    return AVAILABLE_ICONS[9]; // default file icon
};

export default function Bills() {
  const { t } = useTranslation();
  const { formatCurrency } = usePreferences();
  const [bills, setBills] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [billToPay, setBillToPay] = useState<any | null>(null);
  const [billToDelete, setBillToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBills = async () => {
      try {
          const res = await axiosClient.get('/bills');
          setBills(res.data);
      } catch (err) {
          console.error(err);
      }
  };

  useEffect(() => {
      fetchBills();
  }, []);

  const handleDelete = async (id: number) => {
      setIsDeleting(true);
      try {
          await axiosClient.delete(`/bills/${id}`);
          fetchBills();
      } catch (err: any) {
          toast.error(err.response?.data?.error || err.response?.data || t('error'));
      } finally {
          setIsDeleting(false);
          setBillToDelete(null);
      }
  };

  const totalPages = Math.ceil(bills.length / itemsPerPage);
  const paginatedBills = bills.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      <BillDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} onSuccess={fetchBills} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('bills.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('bills.subtitle')}</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="rounded-lg shadow-sm gap-2">
            <Plus className="h-4 w-4" /> {t('bills.addBill')}
        </Button>
      </div>

      <div className="grid gap-4">
        {bills.length === 0 && <p className="text-muted-foreground">{t('bills.noBills')}</p>}
        {paginatedBills.map(bill => {
            const style = getBillIcon(bill);
            const Icon = style.icon;
            
            const isFarFuture = bill.dueDate && (new Date(bill.dueDate).getTime() - new Date().getTime() > 14 * 24 * 60 * 60 * 1000);
            const isPayable = !bill.isPaid && !isFarFuture;
            
            return (
            <Card key={bill.id} className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center p-4 gap-4">
                <div className={`p-4 rounded-xl ${style.bg}`}>
                    <Icon className={`h-6 w-6 ${style.color}`} />
                </div>
                <div className="flex-1 space-y-1">
                    <CardTitle className="text-lg">{bill.name}</CardTitle>
                    <CardDescription>{t('bills.dueOn')} {bill.dueDate || t('bills.na')} ({bill.frequency})</CardDescription>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 sm:gap-1">
                    <div className="font-bold text-lg">{formatCurrency(bill.amount)}</div>
                    {bill.isPaid && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{t('bills.paid')}</span>}
                    {!bill.isPaid && <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">{t('bills.upcoming')}</span>}
                </div>
                {isPayable && (
                    <Button variant="outline" className="w-full sm:w-auto mt-2 sm:mt-0 rounded-lg" onClick={() => setBillToPay(bill)}>
                        {t('bills.payNow')}
                    </Button>
                )}
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setBillToDelete(bill.id)}>
                    <Trash2 className="h-4 w-4" />
                </Button>
            </Card>
        )})}
      </div>
      
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
      
      <PayBillDialog
          isOpen={!!billToPay}
          onClose={() => setBillToPay(null)}
          onSuccess={fetchBills}
          bill={billToPay}
      />
      <ConfirmDialog 
          isOpen={!!billToDelete}
          title={t('delete')}
          description={t('confirm')}
          onConfirm={() => billToDelete && handleDelete(billToDelete)}
          onCancel={() => setBillToDelete(null)}
          isLoading={isDeleting}
      />
    </div>
  );
}
