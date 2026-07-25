import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { usePreferences } from '../context/PreferencesContext';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Shield, Download, Upload, Settings as SettingsIcon, QrCode, Loader2, CheckCircle2, ShieldOff } from 'lucide-react';

export default function Settings() {
    const { t } = useTranslation();
    const { language, setLanguage, currency, setCurrency } = usePreferences();
    const { user } = useAuth();
    
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');
    const [loading2fa, setLoading2fa] = useState(false);
    const [verifying2fa, setVerifying2fa] = useState(false);
    // Initialize twoFactorEnabled from user context if available
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(user?.twoFactorEnabled || false);
    const [twoFactorError, setTwoFactorError] = useState('');

    const handleGenerate2FA = async () => {
        setLoading2fa(true);
        setTwoFactorError('');
        try {
            const res = await axiosClient.get('/auth/2fa/generate');
            setQrCode(res.data.qrCodeImageBase64);
            setSecret(res.data.secret);
        } catch (error) {
            setTwoFactorError(t('settings.failedGenerate2FA'));
        } finally {
            setLoading2fa(false);
        }
    };

    const handleEnable2FA = async () => {
        if (!code) return;
        setVerifying2fa(true);
        setTwoFactorError('');
        try {
            await axiosClient.post('/auth/2fa/enable', { code });
            setTwoFactorEnabled(true);
            setQrCode('');
        } catch (error: any) {
            setTwoFactorError(error.response?.data?.error || error.response?.data || t('settings.invalidCode'));
        } finally {
            setVerifying2fa(false);
        }
    };

    const handleDisable2FA = async () => {
        setLoading2fa(true);
        try {
            await axiosClient.post('/auth/2fa/disable');
            setTwoFactorEnabled(false);
            setQrCode('');
        } catch (error: any) {
            setTwoFactorError(t('settings.failedDisable2FA'));
        } finally {
            setLoading2fa(false);
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('settings.title')}</h1>
                <p className="text-muted-foreground mt-2">{t('settings.subtitle')}</p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm md:col-span-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <SettingsIcon className="h-4 w-4 text-muted-foreground" /> {t('settings.preferences')}
                        </CardTitle>
                        <CardDescription>{t('settings.preferencesDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('settings.language')}</label>
                                <select 
                                    value={language} 
                                    onChange={(e) => setLanguage(e.target.value as 'en' | 'vi')}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="en">English</option>
                                    <option value="vi">Tiếng Việt</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('settings.currency')}</label>
                                <select 
                                    value={currency} 
                                    onChange={(e) => setCurrency(e.target.value as 'USD' | 'VND')}
                                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                >
                                    <option value="USD">USD ($)</option>
                                    <option value="VND">VND (₫)</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm md:col-span-2">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-4 w-4 text-emerald-500" /> {t('settings.twoFA')}
                        </CardTitle>
                        <CardDescription>{t('settings.twoFADesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {twoFactorEnabled ? (
                            <div className="space-y-4 p-4 border border-border/50 rounded-lg bg-background/50">
                                <div className="flex items-center gap-3 bg-emerald-500/10 text-emerald-500 rounded-lg p-4 border border-emerald-500/20">
                                    <CheckCircle2 className="h-6 w-6" />
                                    <div>
                                        <h4 className="font-semibold">{t('settings.twoFAEnabled')}</h4>
                                        <p className="text-sm opacity-90">{t('settings.twoFAEnabledDesc')}</p>
                                    </div>
                                </div>
                                <Button onClick={handleDisable2FA} disabled={loading2fa} variant="destructive" className="w-full sm:w-auto h-10 gap-2">
                                    {loading2fa ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldOff className="h-4 w-4" />}
                                    {t('settings.disable2FA')}
                                </Button>
                                {twoFactorError && <p className="text-xs text-destructive font-medium">{twoFactorError}</p>}
                            </div>
                        ) : qrCode ? (
                            <div className="space-y-4 p-4 border border-border/50 rounded-lg bg-background/50">
                                <div className="text-center">
                                    <p className="text-sm text-muted-foreground mb-4">{t('settings.scanQR')}</p>
                                    <img src={qrCode} alt="2FA QR Code" className="mx-auto rounded-xl border-4 border-white shadow-lg w-48 h-48" />
                                </div>
                                
                                <div className="space-y-2 max-w-sm mx-auto">
                                    <p className="text-sm text-center text-muted-foreground">{t('settings.enterCode')}</p>
                                    {twoFactorError && <p className="text-xs text-destructive text-center font-medium">{twoFactorError}</p>}
                                    <div className="flex gap-2">
                                        <Input 
                                            value={code} 
                                            onChange={e => setCode(e.target.value)} 
                                            placeholder="000000" 
                                            maxLength={6} 
                                            className="text-center tracking-widest font-mono h-10"
                                        />
                                        <Button onClick={handleEnable2FA} disabled={verifying2fa || code.length !== 6} className="h-10">
                                            {verifying2fa ? <Loader2 className="h-4 w-4 animate-spin" /> : t('settings.verify')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <Button onClick={handleGenerate2FA} disabled={loading2fa} variant="outline" className="w-full sm:w-auto h-10 gap-2">
                                {loading2fa ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                                {t('settings.enable2FA')}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-4 w-4 text-muted-foreground" /> {t('settings.profile')}
                        </CardTitle>
                        <CardDescription>{t('settings.profileDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('settings.fullName')}</label>
                            <Input placeholder="Username" value={user?.username || ''} readOnly className="h-10 bg-background/50 cursor-not-allowed text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('settings.email')}</label>
                            <Input type="email" placeholder="Email" value={user?.email || ''} readOnly className="h-10 bg-background/50 cursor-not-allowed text-muted-foreground" />
                        </div>
                        <Button className="w-full sm:w-auto h-10 mt-2" disabled>{t('settings.saveChanges')}</Button>
                    </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Shield className="h-4 w-4 text-muted-foreground" /> {t('settings.securityData')}
                        </CardTitle>
                        <CardDescription>{t('settings.securityDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50 transition-colors hover:bg-background/80">
                            <div>
                                <h4 className="font-medium text-sm text-foreground">{t('settings.exportData')}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{t('settings.exportDesc')}</p>
                            </div>
                            <Button variant="secondary" size="icon" className="rounded-md h-8 w-8"><Download className="h-4 w-4" /></Button>
                        </div>
                        <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50 transition-colors hover:bg-background/80">
                            <div>
                                <h4 className="font-medium text-sm text-foreground">{t('settings.importData')}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{t('settings.importDesc')}</p>
                            </div>
                            <Button variant="secondary" size="icon" className="rounded-md h-8 w-8"><Upload className="h-4 w-4" /></Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
