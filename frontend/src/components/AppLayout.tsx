import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Receipt, Wallet, PieChart, Target, CalendarDays, Settings, Plus, Moon, Sun, LogOut, Menu, X } from 'lucide-react';
import { useTheme } from './theme-provider';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { TransactionDialog } from './TransactionDialog';

export const AppLayout = () => {
    const { theme, setTheme } = useTheme();
    const { t } = useTranslation();
    const { logout } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: t('nav.dashboard'), icon: LayoutDashboard, path: '/' },
        { name: t('nav.transactions'), icon: Receipt, path: '/transactions' },
        { name: t('nav.wallets'), icon: Wallet, path: '/wallets' },
        { name: t('nav.analytics'), icon: PieChart, path: '/analytics' },
        { name: t('nav.budget'), icon: Target, path: '/budget' },
        { name: t('nav.goals'), icon: Target, path: '/goals' },
        { name: t('nav.bills'), icon: CalendarDays, path: '/bills' },
        { name: t('nav.settings'), icon: Settings, path: '/settings' },
    ];

    const handleTransactionSuccess = () => {
        // Simple reload to refresh data across all components
        window.location.reload();
    };

    return (
        <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/20">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm shadow-sm transition-all duration-300">
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Wallet className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Finova</h2>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                        {theme === 'dark' ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
                    </Button>
                </div>
                
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-hide">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                                    isActive 
                                    ? 'bg-secondary/80 text-foreground font-medium' 
                                    : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                                }`
                            }
                        >
                            <item.icon className={`h-4 w-4 ${window.location.pathname === item.path ? 'text-primary' : ''}`} />
                            <span className="text-sm">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-border/50 space-y-2">
                    <Button 
                        onClick={() => setIsDialogOpen(true)}
                        className="w-full gap-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-none font-medium h-10"
                    >
                        <Plus className="h-4 w-4" /> {t('nav.addTransaction')}
                    </Button>
                    <Button 
                        variant="ghost"
                        onClick={logout}
                        className="w-full gap-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors shadow-none font-medium h-10 justify-start px-3"
                    >
                        <LogOut className="h-4 w-4" /> {t('nav.logout')}
                    </Button>
                </div>
            </aside>

            {/* Mobile View */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="mr-1 h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="h-5 w-5" />
                        </Button>
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <Wallet className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="text-lg font-bold">Finova</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-muted-foreground" onClick={logout}>
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
                    <div className="max-w-6xl mx-auto h-full">
                        <Outlet />
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="md:hidden fixed bottom-0 w-full bg-background/90 backdrop-blur-xl border-t border-border flex justify-around p-2 pb-safe z-30">
                    {navItems.slice(0, 4).map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex flex-col items-center p-2 rounded-xl transition-colors ${
                                    isActive ? 'text-primary' : 'text-muted-foreground'
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`h-6 w-6 ${isActive ? 'scale-110' : ''} transition-transform`} />
                                    <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex flex-col items-center p-2 rounded-xl transition-colors text-muted-foreground"
                    >
                        <Menu className="h-6 w-6 transition-transform" />
                        <span className="text-[10px] mt-1 font-medium">{t('nav.settings')} +</span>
                    </button>
                </nav>
            </div>
            
            {/* Mobile Drawer (Sidebar) */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" 
                            onClick={() => setIsMobileMenuOpen(false)} 
                        />
                        <motion.div 
                            initial={{ x: '-100%' }} 
                            animate={{ x: 0 }} 
                            exit={{ x: '-100%' }} 
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
                            className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-2xl flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between border-b border-border/50">
                                <div className="flex items-center gap-2">
                                    <div className="bg-primary/10 p-2 rounded-xl">
                                        <Wallet className="h-6 w-6 text-primary" />
                                    </div>
                                    <h2 className="text-xl font-bold">Finova</h2>
                                </div>
                                <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                                                isActive 
                                                ? 'bg-primary/10 text-primary font-medium' 
                                                : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground'
                                            }`
                                        }
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </NavLink>
                                ))}
                            </nav>
                            <div className="p-4 border-t border-border/50 space-y-2">
                                <Button variant="ghost" onClick={logout} className="w-full justify-start gap-2 text-muted-foreground">
                                    <LogOut className="h-5 w-5" /> {t('nav.logout')}
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            
            {/* Mobile FAB */}
            <div className="md:hidden fixed bottom-20 right-4 z-40">
                <Button 
                    size="icon" 
                    onClick={() => setIsDialogOpen(true)}
                    className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 bg-gradient-to-tr from-primary to-emerald-400"
                >
                    <Plus className="h-6 w-6" />
                </Button>
            </div>

            <TransactionDialog 
                isOpen={isDialogOpen} 
                onClose={() => setIsDialogOpen(false)} 
                onSuccess={handleTransactionSuccess}
            />
        </div>
    );
};
