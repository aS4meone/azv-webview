import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/provider/AuthContext";

import { getLocale, getMessages } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import {
  ModalProvider,
  ResponseModalProvider,
  ModalPortal,
} from "@/shared/ui/modal";
import { PhotoUploadProvider } from "@/shared/contexts/PhotoUploadContext";
import { LanguageProvider } from "@/shared/contexts/LanguageContext";
import { ReactNativeSyncProvider } from "@/shared/components/ReactNativeSyncProvider";
import { LocalStorageCleanup } from "@/shared/components/LocalStorageCleanup";
import { DebugConsole } from "@/components/DebugConsole";

// Импортируем click fixer для автоматического исправления кликов в WebView
import "@/shared/utils/clickFix";
// Импортируем диагностический инструмент для WebView
import "@/shared/utils/webview-diagnosis";
// Импортируем отладчик WebView для отслеживания дублирующихся запросов
import "@/shared/utils/webview-debug";

// Импортируем click tracker для отправки данных на backend

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "AZV Motors",
  description: "AZV Motors - Мобильное приложение",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />

        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />

        {/* Forte Bank Payment Widget Script */}
        <script
          type="text/javascript"
          src="https://js.fortebank.com/widget/be_gateway.js"
          async
        />
      </head>
      <body
        className={`${montserrat.variable} antialiased`}
        suppressHydrationWarning
      >
        <LocalStorageCleanup />
        {/* Debug Console - только в режиме разработки или для WebView */}
        <DebugConsole enabled={process.env.NODE_ENV === 'development' || typeof window !== 'undefined' && !!(window as any).ReactNativeWebView} maxLogs={200} />
        <ResponseModalProvider>
          <ModalProvider>
            <NextIntlClientProvider locale={locale as "ru" | "en" | "kz"} messages={messages}>
              <LanguageProvider initialLocale={locale as "ru" | "en" | "kz"}>
                <AuthProvider>
                  <ReactNativeSyncProvider>
                    <PhotoUploadProvider>
                      {children}
                      <ModalPortal />
                    </PhotoUploadProvider>
                  </ReactNativeSyncProvider>
                </AuthProvider>
              </LanguageProvider>
            </NextIntlClientProvider>
          </ModalProvider>
        </ResponseModalProvider>
      </body>
    </html>
  );
}
