import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/features/auth/provider/AuthContext";

import { getLocale } from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { ModalProvider, ResponseModalProvider } from "@/shared/ui/modal";
import { BrowserProtectionProvider } from "@/shared/contexts/BrowserProtectionProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AZV Motors",
  description: "AZV Motors - Мобильное приложение",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AZV Motors",
  },
  other: {
    "msapplication-tap-highlight": "no",
    "apple-mobile-web-app-capable": "yes",
    "apple-touch-fullscreen": "yes",
  } as Record<string, string>,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <head>
        {/* 🔒 Дополнительные мета-теги для защиты */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />

        {/* 🔒 Inline CSS для немедленной защиты */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            * {
              -webkit-user-select: none !important;
              -webkit-touch-callout: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
              user-select: none !important;
              -webkit-tap-highlight-color: transparent !important;
              -webkit-user-drag: none !important;
              user-drag: none !important;
            }
            
            html, body {
              /* Разрешаем скролл, запрещаем зум */
              touch-action: pan-y pan-x !important;
              -ms-touch-action: pan-y pan-x !important;
              -webkit-overflow-scrolling: touch !important;
              /* Отключаем pull-to-refresh но разрешаем горизонтальный скролл */
              overscroll-behavior-y: none !important;
              overscroll-behavior-x: auto !important;
            }
            
            input, textarea, [contenteditable="true"] {
              -webkit-user-select: text !important;
              -moz-user-select: text !important;
              -ms-user-select: text !important;
              user-select: text !important;
              font-size: 16px !important;
            }
            
            img {
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              user-select: none !important;
              pointer-events: none !important;
            }
          `,
          }}
        />
      </head>
      <body className={`${montserrat.variable} antialiased`}>
        <BrowserProtectionProvider>
          <NextIntlClientProvider>
            <AuthProvider>
              <ResponseModalProvider>
                <ModalProvider>{children}</ModalProvider>
              </ResponseModalProvider>
            </AuthProvider>
          </NextIntlClientProvider>
        </BrowserProtectionProvider>
      </body>
    </html>
  );
}
