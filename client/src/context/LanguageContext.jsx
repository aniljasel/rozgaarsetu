import React, { createContext, useState, useEffect, useContext } from 'react';
import { TRANSLATIONS } from '../constants/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // 1. Check if user already has a saved language choice. If not, default to English.
    const getInitialLanguage = () => {
        const savedLanguage = localStorage.getItem('rozgaarsetu_pref_lang');
        return savedLanguage || 'en';
    };

    const [language, setLanguageState] = useState(getInitialLanguage);

    // 2. Track if the user has actively selected a language (either previously saved or just now).
    // If not saved in localStorage, we assume they haven't selected one yet.
    const [hasSelectedLanguage, setHasSelectedLanguage] = useState(
        !!localStorage.getItem('rozgaarsetu_pref_lang')
    );

    const setLanguage = (lang) => {
        setLanguageState(lang);
        setHasSelectedLanguage(true);
        localStorage.setItem('rozgaarsetu_pref_lang', lang);
    };

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'hi' : 'en');
    };

    const t = TRANSLATIONS[language];

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, hasSelectedLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
