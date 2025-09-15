"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Locale, localeNames } from '@/i18n/config';

interface LanguageContextType {
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
  localeNames: typeof localeNames;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale: Locale;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ 
  children, 
  initialLocale 
}) => {
  const [currentLocale, setCurrentLocale] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = async (locale: Locale) => {
    setCurrentLocale(locale);
    
    // Сохраняем выбранный язык в cookie
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000`;
    
    // Перезагружаем страницу для применения нового языка
    router.refresh();
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        currentLocale, 
        setLocale, 
        localeNames 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
