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
import ClickTrackerViewer from "@/components/ClickTrackerViewer";

// Импортируем click fixer для автоматического исправления кликов в WebView
import "@/shared/utils/clickFix";
// Импортируем диагностический инструмент для WebView
import "@/shared/utils/webview-diagnosis";
// Импортируем click tracker для отправки данных на backend
import "@/shared/utils/click-tracker";
// Импортируем тестовый файл для проверки работы click-tracker
import "@/shared/utils/test-click-tracker";

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
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />

        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />

        {/* Простой inline click tracker для тестирования */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
          (function() {
            console.log('🔧 Inline Click Tracker загружен');
            
            const BACKEND_URL = 'http://localhost:3001';
            
            async function sendClickData(data) {
              try {
                console.log('🚀 Отправляем данные:', data);
                const response = await fetch(BACKEND_URL + '/api/clicks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data)
                });
                
                if (response.ok) {
                  const result = await response.json();
                  console.log('✅ Данные отправлены:', result);
                } else {
                  console.error('❌ Ошибка отправки:', response.status);
                }
              } catch (error) {
                console.error('❌ Ошибка запроса:', error);
              }
            }
            
            // Обработчик кликов
            function handleClick(event) {
              const target = event.target;
              const isClickable = target.matches('button, [role="button"], .cursor-pointer, a, [onclick], input[type="button"], input[type="submit"], [class*="bg-white"], [class*="bg-black"], [class*="bg-red-"]');
              
              if (isClickable) {
                console.log('🖱️ Клик по кликабельному элементу:', target);
                
                const data = {
                  elementTag: target.tagName.toLowerCase(),
                  elementId: target.id || undefined,
                  elementClass: target.className || undefined,
                  elementText: target.textContent?.trim()?.substring(0, 100) || undefined,
                  x: Math.round(event.clientX),
                  y: Math.round(event.clientY),
                  success: true,
                  userAgent: navigator.userAgent,
                  screenWidth: window.screen.width,
                  screenHeight: window.screen.height,
                  viewportWidth: window.innerWidth,
                  viewportHeight: window.innerHeight,
                  devicePixelRatio: window.devicePixelRatio,
                  url: window.location.href,
                  pageTitle: document.title
                };
                
                sendClickData(data);
              }
            }
            
            // Глобальная функция для отправки данных о кликах (для UI компонентов)
            window.sendClickData = sendClickData;
            
            // Тестовая функция
            window.testDirectClick = function() {
              const testData = {
                elementTag: 'button',
                elementId: 'test-inline',
                elementClass: 'test-inline-class',
                elementText: 'Inline Test Click',
                x: 200,
                y: 300,
                success: true,
                userAgent: navigator.userAgent,
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                viewportWidth: window.innerWidth,
                viewportHeight: window.innerHeight,
                devicePixelRatio: window.devicePixelRatio,
                url: window.location.href,
                pageTitle: document.title
              };
              
              console.log('🧪 Тестовая отправка...');
              sendClickData(testData);
            };
            
            // Установка обработчиков
            document.addEventListener('click', handleClick, true);
            
            console.log('🎯 Inline Click Tracker активирован!');
          })();
        `,
          }}
        />
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
                    <ClickTrackerViewer />
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
