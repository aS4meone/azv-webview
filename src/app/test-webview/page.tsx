"use client";

import { useState, useEffect } from "react";
import { WebViewDiagnostics } from "@/components/WebViewDiagnostics";
import { DebugConsole } from "@/components/DebugConsole";

export default function TestWebViewPage() {
  const [webViewInfo, setWebViewInfo] = useState<any>({});
  const [htmlContent, setHtmlContent] = useState<string>("");

  useEffect(() => {
    // Detect WebView environment
    const isWebView = !!(window as any).ReactNativeWebView || 
                     !!(window as any).webkit?.messageHandlers ||
                     /wv|WebView/i.test(navigator.userAgent);

    setWebViewInfo({
      isWebView,
      userAgent: navigator.userAgent,
      hasReactNativeWebView: !!(window as any).ReactNativeWebView,
      hasWebKitHandlers: !!(window as any).webkit?.messageHandlers,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });

    // Test HTML loading
    const testHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif; 
              padding: 20px; 
              line-height: 1.6;
              font-size: 16px;
            }
            .test-box {
              background: #f0f0f0;
              padding: 20px;
              margin: 10px 0;
              border-radius: 8px;
            }
          </style>
        </head>
        <body>
          <h1>Тест WebView</h1>
          <div class="test-box">
            <h2>Информация о среде:</h2>
            <p><strong>WebView:</strong> ${isWebView ? 'Да' : 'Нет'}</p>
            <p><strong>User Agent:</strong> ${navigator.userAgent}</p>
            <p><strong>Ширина экрана:</strong> ${window.innerWidth}px</p>
            <p><strong>Высота экрана:</strong> ${window.innerHeight}px</p>
          </div>
          <div class="test-box">
            <h2>Тест прокрутки:</h2>
            <p>Проведите пальцем для прокрутки этого контента.</p>
            ${Array.from({ length: 20 }, (_, i) => `<p>Строка ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>`).join('')}
          </div>
        </body>
      </html>
    `;

    setHtmlContent(testHTML);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Debug Console is always enabled on test page */}
      <DebugConsole enabled={true} maxLogs={500} />
      
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Тест WebView</h1>
        
        {/* Test buttons for logging */}
        <div className="bg-white rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-3">Тест логирования:</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => console.log("Test log message", { test: true })}
              className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              Test Log
            </button>
            <button
              onClick={() => console.info("Test info message", { info: "data" })}
              className="px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Test Info
            </button>
            <button
              onClick={() => console.warn("Test warning message")}
              className="px-3 py-2 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
            >
              Test Warn
            </button>
            <button
              onClick={() => console.error("Test error message", new Error("Test error"))}
              className="px-3 py-2 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Test Error
            </button>
          </div>
        </div>
        
        {/* WebView Diagnostics */}
        <div className="mb-6">
          <WebViewDiagnostics />
        </div>

        {/* WebView Info */}
        <div className="bg-white rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Информация о среде выполнения:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {JSON.stringify(webViewInfo, null, 2)}
          </pre>
        </div>

        {/* HTML Test */}
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Тест HTML рендеринга:</h2>
          </div>
          <div 
            className="h-96 overflow-auto p-4"
            style={{ WebkitOverflowScrolling: 'touch' }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Iframe Test */}
        <div className="bg-white rounded-lg overflow-hidden mt-6">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Тест iframe:</h2>
          </div>
          <iframe
            srcDoc={htmlContent}
            className="w-full h-96 border-0"
            style={{ WebkitOverflowScrolling: 'touch' }}
            sandbox="allow-same-origin allow-scripts"
            title="WebView Test"
            onLoad={() => console.log('✅ Iframe loaded')}
            onError={() => console.log('❌ Iframe error')}
          />
        </div>
      </div>
    </div>
  );
}
