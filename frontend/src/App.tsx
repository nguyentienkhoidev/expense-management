import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './components/theme-provider';
import { PreferencesProvider } from './context/PreferencesContext';
import './i18n';
import { AppLayout } from './components/AppLayout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Wallets from './pages/Wallets';
import Analytics from './pages/Analytics';
import Budget from './pages/Budget';
import Goals from './pages/Goals';
import Bills from './pages/Bills';
import Settings from './pages/Settings';
import './index.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    
    if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    
    return <>{children}</>;
};

import { Toaster } from 'sonner';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="finova-theme">
        <PreferencesProvider>
            <Toaster richColors position="top-right" />
            <Router>
                <AuthProvider>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/" element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Dashboard />} />
                            <Route path="transactions" element={<Transactions />} />
                            <Route path="wallets" element={<Wallets />} />
                            <Route path="analytics" element={<Analytics />} />
                            <Route path="budget" element={<Budget />} />
                            <Route path="goals" element={<Goals />} />
                            <Route path="bills" element={<Bills />} />
                            <Route path="settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </AuthProvider>
            </Router>
        </PreferencesProvider>
    </ThemeProvider>
  );
}

export default App;
