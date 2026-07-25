import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosClient from '../api/axiosClient';
import { AuthContext } from '../context/AuthContext';
import { Wallet, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const Login: React.FC = () => {
    const { t } = useTranslation();
    const [isLogin, setIsLogin] = useState(true);
    const [requires2FA, setRequires2FA] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            if (requires2FA) {
                const res = await axiosClient.post('/auth/verify-2fa', { username, password, code: twoFactorCode });
                login(res.data, res.data.token);
            } else if (isLogin) {
                const res = await axiosClient.post('/auth/login', { username, password });
                if (res.data.requiresTwoFactor) {
                    setRequires2FA(true);
                } else {
                    login(res.data, res.data.token);
                }
            } else {
                await axiosClient.post('/auth/register', { username, email, password });
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.response?.data || t('auth.errorOccurred'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Premium Mesh Gradient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen" />
                <div className="absolute top-[20%] -right-[20%] w-[60%] h-[60%] rounded-full bg-secondary/5 blur-[120px] mix-blend-screen" />
                <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-emerald-500/5 blur-[150px] mix-blend-screen" />
            </div>

            <div className="w-full max-w-[420px] relative z-10">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-3xl border border-primary/10 shadow-lg shadow-primary/5 mb-6">
                        {requires2FA ? (
                            <ShieldCheck className="h-10 w-10 text-primary" strokeWidth={1.5} />
                        ) : (
                            <Wallet className="h-10 w-10 text-primary" strokeWidth={1.5} />
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('auth.appName')}</h1>
                    <p className="text-muted-foreground mt-2 text-sm max-w-[280px]">
                        {requires2FA ? t('auth.twoFASubtitle') : isLogin ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}
                    </p>
                </div>

                <Card className="glass border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl">
                    <CardContent className="pt-8 px-8">
                        {error && (
                            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-xl mb-6 border border-destructive/20 text-center font-medium">
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {requires2FA ? (
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('auth.authCode')}</label>
                                    <Input 
                                        type="text" 
                                        value={twoFactorCode} 
                                        onChange={e => setTwoFactorCode(e.target.value)} 
                                        required 
                                        className="bg-background/40 h-12 rounded-xl focus-visible:ring-primary/50 border-border/50 text-base px-4 transition-all tracking-[0.5em] text-center font-mono"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('auth.username')}</label>
                                        <Input 
                                            type="text" 
                                            value={username} 
                                            onChange={e => setUsername(e.target.value)} 
                                            required 
                                            className="bg-background/40 h-12 rounded-xl focus-visible:ring-primary/50 border-border/50 text-base px-4 transition-all"
                                            placeholder={t('auth.enterUsername')}
                                        />
                                    </div>
                                    
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('auth.email')}</label>
                                            <Input 
                                                type="email" 
                                                value={email} 
                                                onChange={e => setEmail(e.target.value)} 
                                                required 
                                                className="bg-background/40 h-12 rounded-xl focus-visible:ring-primary/50 border-border/50 text-base px-4 transition-all"
                                                placeholder={t('auth.enterEmail')}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('auth.password')}</label>
                                            {isLogin && <Link to="/forgot-password" className="text-xs text-primary hover:underline font-medium">{t('auth.forgot')}</Link>}
                                        </div>
                                        <Input 
                                            type="password" 
                                            value={password} 
                                            onChange={e => setPassword(e.target.value)} 
                                            required 
                                            className="bg-background/40 h-12 rounded-xl focus-visible:ring-primary/50 border-border/50 text-base px-4 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </>
                            )}
                            
                            <Button 
                                type="submit" 
                                className="w-full h-12 rounded-xl font-medium text-base shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all mt-4 flex items-center justify-center gap-2 group"
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>
                                        {requires2FA ? t('auth.verifyCode') : isLogin ? t('auth.signIn') : t('auth.createAccount')}
                                        <ArrowRight className="h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    
                    {!requires2FA && (
                        <div className="pb-8 pt-4 px-8 text-center">
                            <p className="text-sm text-muted-foreground">
                                {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
                                <button 
                                    type="button"
                                    className="text-foreground font-semibold hover:text-primary transition-colors"
                                    onClick={() => { setIsLogin(!isLogin); setError(''); }}
                                >
                                    {isLogin ? t('auth.signUp') : t('auth.signIn')}
                                </button>
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default Login;
