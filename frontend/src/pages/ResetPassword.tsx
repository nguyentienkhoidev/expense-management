import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import { KeyRound, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const ResetPassword = () => {
    const { t } = useTranslation();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setError(t('auth.passwordsNoMatch'));
            return;
        }

        if (!token) {
            setError(t('auth.invalidToken'));
            return;
        }

        setLoading(true);
        
        try {
            await axiosClient.post('/auth/reset-password', { token, newPassword: password });
            setSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data || t('auth.failedReset'));
        } finally {
            setLoading(false);
        }
    };

    if (!token && !success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-destructive">{t('auth.invalidLink')}</h2>
                    <p className="text-muted-foreground">{t('auth.invalidLinkDesc')}</p>
                    <Link to="/login" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mt-4">
                        {t('auth.goToLogin')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen" />
                <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-secondary/5 blur-[120px] mix-blend-screen" />
            </div>

            <div className="w-full max-w-[420px] relative z-10">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-3xl border border-primary/10 shadow-lg shadow-primary/5 mb-6">
                        <KeyRound className="h-10 w-10 text-primary" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('auth.createNewPassword')}</h1>
                    <p className="text-muted-foreground mt-2 text-sm max-w-[280px]">
                        {t('auth.newPasswordSubtitle')}
                    </p>
                </div>

                <Card className="glass border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl">
                    <CardContent className="pt-8 px-8 pb-8">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-6 border border-destructive/20 text-center font-medium">
                                {error}
                            </div>
                        )}

                        {success ? (
                            <div className="text-center space-y-6 py-4">
                                <div className="flex justify-center">
                                    <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-semibold">{t('auth.passwordResetSuccess')}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {t('auth.passwordResetRedirect')}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('auth.newPassword')}</label>
                                    <Input 
                                        type="password" 
                                        value={password} 
                                        onChange={e => setPassword(e.target.value)} 
                                        required 
                                        className="bg-background/40 h-12 rounded-xl focus-visible:ring-primary/50 border-border/50 text-base px-4 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('auth.confirmPassword')}</label>
                                    <Input 
                                        type="password" 
                                        value={confirmPassword} 
                                        onChange={e => setConfirmPassword(e.target.value)} 
                                        required 
                                        className="bg-background/40 h-12 rounded-xl focus-visible:ring-primary/50 border-border/50 text-base px-4 transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                
                                <Button 
                                    type="submit" 
                                    className="w-full h-12 rounded-xl font-medium text-base shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all mt-4 flex items-center justify-center gap-2 group"
                                    disabled={loading || !password || !confirmPassword}
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                        <>
                                            {t('auth.resetPassword')}
                                            <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ResetPassword;
