"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLanguage } from '@/shared/contexts/LanguageContext';
import { Locale } from '@/i18n/config';
import { IoLanguage } from 'react-icons/io5';
import { IoChevronDown } from 'react-icons/io5';

interface LanguageSelectorProps {
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const t = useTranslations('language');
  const { currentLocale, setLocale, localeNames } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (locale: Locale) => {
    setLocale(locale);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <IoLanguage className="w-5 h-5" />
        <span className="text-sm font-medium">
          {localeNames[currentLocale]}
        </span>
        <IoChevronDown 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          {Object.entries(localeNames).map(([locale, name]) => (
            <button
              key={locale}
              onClick={() => handleLanguageChange(locale as Locale)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                currentLocale === locale 
                  ? 'bg-gray-800 text-white font-semibold' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
