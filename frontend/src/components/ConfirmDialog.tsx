import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from './ui/button';

interface ConfirmDialogProps {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'danger' | 'default';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    title,
    description,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    variant = 'danger',
    isLoading = false
}: ConfirmDialogProps) {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                        animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, x: "-50%", y: "-45%" }}
                        className="fixed left-1/2 top-1/2 z-[60] w-full max-w-sm rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl p-6"
                    >
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold">{title}</h2>
                                <p className="text-sm text-muted-foreground">{description}</p>
                            </div>
                            
                            <div className="flex w-full gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={onCancel}
                                    disabled={isLoading}
                                >
                                    {cancelText || t('cancel')}
                                </Button>
                                <Button
                                    type="button"
                                    variant={variant === 'danger' ? 'destructive' : 'default'}
                                    className="flex-1"
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                >
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (confirmText || t('confirm'))}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
