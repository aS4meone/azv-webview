export type Locale = (typeof locales)[number];

export const locales = ["ru", "en", "kz"] as const;
export const defaultLocale: Locale = "ru";

export const localeNames = {
  ru: "Русский",
  en: "English", 
  kz: "Қазақша"
} as const;
