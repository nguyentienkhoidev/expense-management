import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';

type Currency = 'USD' | 'VND';
type Language = 'en' | 'vi';

interface PreferencesContextType {
    currency: Currency;
    language: Language;
    setCurrency: (currency: Currency) => void;
    setLanguage: (lang: Language) => void;
    formatCurrency: (amount: number) => string;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrencyState] = useState<Currency>(() => 
        (localStorage.getItem('finova_currency') as Currency) || 'USD'
    );
    const [language, setLanguageState] = useState<Language>(() => 
        (localStorage.getItem('finova_lang') as Language) || 'en'
    );

    const setCurrency = (curr: Currency) => {
        setCurrencyState(curr);
        localStorage.setItem('finova_currency', curr);
    };

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('finova_lang', lang);
        i18n.changeLanguage(lang);
    };

    const formatCurrency = (amount: number) => {
        if (currency === 'VND') {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        }
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    useEffect(() => {
        // Ensure i18n matches initial state
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language]);

    return (
        <PreferencesContext.Provider value={{ currency, language, setCurrency, setLanguage, formatCurrency }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error("usePreferences must be used within a PreferencesProvider");
    }
    return context;
};
