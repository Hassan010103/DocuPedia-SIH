import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import en from '../locales/en.json';
import ml from '../locales/ml.json';

type Language = 'en' | 'ml';

// Define a type for our translations object
type Translations = {
  [key: string]: any;
};

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: string, params?: { [key: string]: any }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// FIX: Updated component definition to use React.FC with an explicit props interface, resolving a cascading type error in App.tsx.
interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  // Bundle translations at build-time to ensure availability on all hosts (e.g., Vercel)
  const translations: { en: Translations; ml: Translations } = { en, ml };

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
  };

  const t = useCallback((key: string, params?: { [key: string]: any }): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations.en;
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
            if (fallbackResult === undefined) return key;
        }
        result = fallbackResult;
        break;
      }
    }

    if (typeof result === 'string' && params) {
      return Object.entries(params).reduce((acc, [paramKey, paramValue]) => {
        return acc.replace(`{{${paramKey}}}`, String(paramValue));
      }, result);
    }
    
    return typeof result === 'string' ? result : key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
