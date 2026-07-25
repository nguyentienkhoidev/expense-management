import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus, Wallet as WalletIcon, CreditCard, Building2, Smartphone, ArrowRightLeft, MoreHorizontal, Loader2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { WalletDialog } from '../components/WalletDialog';
import { TransferDialog } from '../components/TransferDialog';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from 'sonner';

interface Wallet {
  id: number;
  name: string;
  type: string;
  balance: number;
  isActive: boolean;
}

import { PiggyBank, Landmark, CircleDollarSign, Coins, Gem, Bitcoin } from 'lucide-react';

const AVAILABLE_ICONS = [
    { key: 'bank', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { key: 'wallet', icon: WalletIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { key: 'credit', icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { key: 'smartphone', icon: Smartphone, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
    { key: 'piggy', icon: PiggyBank, color: 'text-pink-500', bg: 'bg-pink-500/10' },
    { key: 'landmark', icon: Landmark, color: 'text-slate-500', bg: 'bg-slate-500/10' },
    { key: 'dollar', icon: CircleDollarSign, color: 'text-green-500', bg: 'bg-green-500/10' },
    { key: 'coins', icon: Coins, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { key: 'gem', icon: Gem, color: 'text-cyan-500', bg: 'bg-cyan-500/10' },
    { key: 'bitcoin', icon: Bitcoin, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

const getWalletStyle = (wallet: any) => {
    if (wallet.icon) {
        const found = AVAILABLE_ICONS.find(i => i.key === wallet.icon);
        if (found) return { icon: found.icon, color: found.color, bg: found.bg };
    }

    switch ((wallet.type || '').toLowerCase()) {
        case 'bank account':
        case 'bank': return { icon: Building2, color: 'text-blue-500', bg: 'bg-blue-500/10' };
        case 'credit card': return { icon: CreditCard, color: 'text-red-500', bg: 'bg-red-500/10' };
        case 'e-wallet': return { icon: Smartphone, color: 'text-purple-500', bg: 'bg-purple-500/10' };
        default: return { icon: WalletIcon, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
    }
};

export default function Wallets() {
  const { t } = useTranslation();
  const { formatCurrency } = usePreferences();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [walletToEdit, setWalletToEdit] = useState<Wallet | null>(null);
  const [walletToDelete, setWalletToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState<number | null>(null);

  const fetchWalletsAndTransfers = async () => {
    try {
      const [walletRes, transferRes] = await Promise.all([
          axiosClient.get('/wallets'),
          axiosClient.get('/transfers')
      ]);
      setWallets(walletRes.data);
      setTransfers(transferRes.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletsAndTransfers();
  }, []);

  const handleDelete = async (id: number) => {
      setIsDeleting(true);
      try {
          await axiosClient.delete(`/wallets/${id}`);
          fetchWalletsAndTransfers();
      } catch(err: any) {
          toast.error(err.response?.data?.error || err.response?.data || t('auth.failedDeleteWallet'));
      } finally {
          setIsDeleting(false);
          setWalletToDelete(null);
      }
  };

  const handleToggleStatus = async (id: number) => {
      setIsToggling(id);
      try {
          await axiosClient.put(`/wallets/${id}/toggle-status`);
          fetchWalletsAndTransfers();
          toast.success("Wallet status updated");
      } catch (err: any) {
          toast.error("Failed to update wallet status");
      } finally {
          setIsToggling(null);
      }
  };


  return (
    <div className="space-y-6">
      <WalletDialog 
        isOpen={isWalletDialogOpen} 
        onClose={() => { setIsWalletDialogOpen(false); setWalletToEdit(null); }} 
        onSuccess={fetchWalletsAndTransfers}
        walletToEdit={walletToEdit}
      />
      <TransferDialog isOpen={isTransferDialogOpen} onClose={() => setIsTransferDialogOpen(false)} onSuccess={fetchWalletsAndTransfers} />
      
      <ConfirmDialog 
        isOpen={!!walletToDelete}
        title={t('delete')}
        description={t('wallets.confirmDelete')}
        onConfirm={() => walletToDelete && handleDelete(walletToDelete)}
        onCancel={() => setWalletToDelete(null)}
        isLoading={isDeleting}
      />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('wallets.title')}</h1>
          <p className="text-muted-foreground mt-1">{t('wallets.subtitle')}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(true)} className="rounded-lg flex-1 sm:flex-none gap-2">
                <ArrowRightLeft className="h-4 w-4" /> {t('wallets.transfer')}
            </Button>
            <Button onClick={() => setIsWalletDialogOpen(true)} className="rounded-lg shadow-sm flex-1 sm:flex-none gap-2">
                <Plus className="h-4 w-4" /> {t('wallets.addWallet')}
            </Button>
        </div>
      </div>

      {loading ? (
          <div className="py-20 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet) => {
              const style = getWalletStyle(wallet);
              const Icon = style.icon;
              return (
                <Card key={wallet.id} className={`bg-card/50 backdrop-blur-sm border-border/50 shadow-sm overflow-hidden relative group hover:border-primary/50 transition-colors ${!wallet.isActive ? 'opacity-50 grayscale' : ''}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Icon className={`h-24 w-24 ${style.color}`} />
                    </div>
                    {!wallet.isActive && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-muted text-muted-foreground px-2 py-1 rounded-md text-xs font-semibold uppercase tracking-wider z-10">
                            Disabled
                        </div>
                    )}
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl ${style.bg}`}>
                                <Icon className={`h-5 w-5 ${style.color}`} />
                            </div>
                            <div>
                                <CardTitle className="text-base font-medium">{wallet.name}</CardTitle>
                                <CardDescription className="text-xs">{wallet.type}</CardDescription>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-lg relative z-10">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-lg">
                                <DropdownMenuItem onClick={() => handleToggleStatus(wallet.id)} disabled={isToggling === wallet.id} className="cursor-pointer">
                                    {wallet.isActive ? 'Disable Wallet' : 'Enable Wallet'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setWalletToDelete(wallet.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">{t('wallets.deleteWallet')}</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="mt-4">
                        <div className={`text-3xl font-bold tracking-tight ${wallet.balance < 0 ? 'text-destructive' : ''}`}>
                            {wallet.balance < 0 ? '-' : ''}{formatCurrency(Math.abs(wallet.balance))}
                        </div>
                    </CardContent>
                </Card>
              );
            })}
          </div>
      )}

      <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                  <CardTitle>{t('wallets.recentTransfers')}</CardTitle>
                  <CardDescription>{t('wallets.recentTransfersDesc')}</CardDescription>
              </div>
              {transfers.length > 0 && (
                  <Button variant="outline" size="sm" className="rounded-lg gap-2" onClick={() => setIsTransferDialogOpen(true)}>
                      <ArrowRightLeft className="h-4 w-4" /> {t('wallets.transfer')}
                  </Button>
              )}
          </CardHeader>
          <CardContent>
              {transfers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-muted p-4 rounded-full mb-4">
                          <ArrowRightLeft className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium">{t('wallets.noTransfers')}</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                          {t('wallets.noTransfersDesc')}
                      </p>
                      <Button variant="outline" className="rounded-lg gap-2" onClick={() => setIsTransferDialogOpen(true)}>
                          <ArrowRightLeft className="h-4 w-4" /> {t('wallets.transferMoney')}
                      </Button>
                  </div>
              ) : (
                  <div className="space-y-4">
                      {transfers.map(transfer => (
                          <div key={transfer.id} className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/50">
                              <div className="flex items-center gap-4">
                                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                                      <ArrowRightLeft className="h-5 w-5" />
                                  </div>
                                  <div>
                                      <div className="flex items-center gap-2 font-medium">
                                          <span>{transfer.fromWallet.name}</span>
                                          <ArrowRightLeft className="h-3 w-3 text-muted-foreground" />
                                          <span>{transfer.toWallet.name}</span>
                                      </div>
                                      <div className="text-xs text-muted-foreground mt-0.5">
                                          {transfer.transferDate} {transfer.note ? `• ${transfer.note}` : ''}
                                      </div>
                                  </div>
                              </div>
                              <div className="font-semibold">{formatCurrency(transfer.amount)}</div>
                          </div>
                      ))}
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}
