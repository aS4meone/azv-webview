import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/provider/AuthContext";

import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import {
  ModalProvider,
  ResponseModalProvider,
  ModalPortal,
} from "@/shared/ui/modal";
import { PhotoUploadProvider } from "@/shared/contexts/PhotoUploadContext";
import { DeliveryPointProvider } from "@/shared/contexts/DeliveryPointContext";

// Импортируем click fixer для автоматического исправления кликов в WebView
import "@/shared/utils/clickFix";

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
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
      </head>
      <body
        className={`${montserrat.variable} antialiased`}
        suppressHydrationWarning
      >
        <ResponseModalProvider>
          <ModalProvider>
            <PhotoUploadProvider>
              <NextIntlClientProvider>
                <AuthProvider>
                  <DeliveryPointProvider>
                    {children}
                    <ModalPortal />
                  </DeliveryPointProvider>
                </AuthProvider>
              </NextIntlClientProvider>
            </PhotoUploadProvider>
          </ModalProvider>
        </ResponseModalProvider>
      </body>
    </html>
  );
}
