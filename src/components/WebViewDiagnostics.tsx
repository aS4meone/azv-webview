"use client";

import { useState, useEffect } from "react";

interface WebViewDiagnosticsProps {
  onDiagnosticsComplete?: (results: any) => void;
}

export const WebViewDiagnostics = ({ onDiagnosticsComplete }: WebViewDiagnosticsProps) => {
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = async () => {
    setIsRunning(true);
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      capabilities: {},
      network: {},
      rendering: {}
    };

    try {
      // Environment detection
      results.environment = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        languages: navigator.languages,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        screenWidth: screen.width,
        screenHeight: screen.height,
        devicePixelRatio: window.devicePixelRatio,
        hasReactNativeWebView: !!(window as any).ReactNativeWebView,
        hasWebKitHandlers: !!(window as any).webkit?.messageHandlers,
        hasPostMessage: typeof window.postMessage === 'function',
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSessionStorage: typeof sessionStorage !== 'undefined',
        hasIndexedDB: typeof indexedDB !== 'undefined',
        hasWebSQL: !!(window as any).openDatabase,
        hasFileAPI: typeof File !== 'undefined',
        hasBlob: typeof Blob !== 'undefined',
        hasURL: typeof URL !== 'undefined',
        hasFetch: typeof fetch !== 'undefined',
        hasXMLHttpRequest: typeof XMLHttpRequest !== 'undefined',
      };

      // WebView specific detection
      const isWebView = !!(window as any).ReactNativeWebView || 
                       !!(window as any).webkit?.messageHandlers ||
                       /wv|WebView/i.test(navigator.userAgent);
      
      results.environment.isWebView = isWebView;
      results.environment.webViewType = isWebView ? 
        ((window as any).ReactNativeWebView ? 'ReactNative' : 
         (window as any).webkit?.messageHandlers ? 'iOS' : 'Unknown') : 'Not WebView';

      // Network capabilities
      try {
        const testResponse = await fetch('/docs/new/accession_agreement.html', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        results.network.fetchSupported = true;
        results.network.fetchStatus = testResponse.status;
        results.network.fetchHeaders = Object.fromEntries(testResponse.headers.entries());
      } catch (fetchError) {
        results.network.fetchSupported = false;
        results.network.fetchError = fetchError.message;
      }

      // XMLHttpRequest test
      try {
        const xhrTest = await new Promise<boolean>((resolve) => {
          const xhr = new XMLHttpRequest();
          xhr.open('HEAD', '/docs/new/accession_agreement.html', true);
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              resolve(xhr.status === 200);
            }
          };
          xhr.onerror = () => resolve(false);
          xhr.send();
        });
        results.network.xhrSupported = xhrTest;
      } catch (xhrError) {
        results.network.xhrSupported = false;
        results.network.xhrError = xhrError.message;
      }

      // Rendering capabilities
      results.rendering = {
        hasCanvas: typeof HTMLCanvasElement !== 'undefined',
        hasSVG: typeof SVGElement !== 'undefined',
        hasWebGL: !!(document.createElement('canvas').getContext('webgl') || document.createElement('canvas').getContext('experimental-webgl')),
        hasCSS3: CSS.supports && CSS.supports('transform', 'translate3d(0,0,0)'),
        hasFlexbox: CSS.supports && CSS.supports('display', 'flex'),
        hasGrid: CSS.supports && CSS.supports('display', 'grid'),
        hasIframe: typeof HTMLIFrameElement !== 'undefined',
        hasObject: typeof HTMLObjectElement !== 'undefined',
        hasEmbed: typeof HTMLEmbedElement !== 'undefined',
      };

      // Iframe test
      try {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.srcdoc = '<html><body>Test</body></html>';
        document.body.appendChild(iframe);
        
        await new Promise((resolve) => {
          iframe.onload = () => resolve(true);
          iframe.onerror = () => resolve(false);
          setTimeout(() => resolve(false), 2000);
        });
        
        results.rendering.iframeWorking = true;
        document.body.removeChild(iframe);
      } catch (iframeError) {
        results.rendering.iframeWorking = false;
        results.rendering.iframeError = iframeError.message;
      }

      // Local storage test
      try {
        const testKey = 'webview_test_' + Date.now();
        localStorage.setItem(testKey, 'test');
        const retrieved = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        results.capabilities.localStorageWorking = retrieved === 'test';
      } catch (lsError) {
        results.capabilities.localStorageWorking = false;
        results.capabilities.localStorageError = lsError.message;
      }

      // Session storage test
      try {
        const testKey = 'webview_session_test_' + Date.now();
        sessionStorage.setItem(testKey, 'test');
        const retrieved = sessionStorage.getItem(testKey);
        sessionStorage.removeItem(testKey);
        results.capabilities.sessionStorageWorking = retrieved === 'test';
      } catch (ssError) {
        results.capabilities.sessionStorageWorking = false;
        results.capabilities.sessionStorageError = ssError.message;
      }

      setDiagnostics(results);
      onDiagnosticsComplete?.(results);
      
    } catch (error) {
      results.error = error.message;
      setDiagnostics(results);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">WebView Диагностика</h3>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isRunning ? 'Проверка...' : 'Запустить снова'}
        </button>
      </div>

      {isRunning && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Выполняется диагностика...</p>
        </div>
      )}

      {Object.keys(diagnostics).length > 0 && !isRunning && (
        <div className="space-y-4">
          {/* Environment */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Среда выполнения:</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>WebView:</strong> {diagnostics.environment?.isWebView ? 'Да' : 'Нет'}</p>
              <p><strong>Тип WebView:</strong> {diagnostics.environment?.webViewType}</p>
              <p><strong>User Agent:</strong> {diagnostics.environment?.userAgent}</p>
              <p><strong>Размер экрана:</strong> {diagnostics.environment?.screenWidth}x{diagnostics.environment?.screenHeight}</p>
              <p><strong>Размер окна:</strong> {diagnostics.environment?.windowWidth}x{diagnostics.environment?.windowHeight}</p>
            </div>
          </div>

          {/* Network */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Сеть:</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>Fetch API:</strong> {diagnostics.network?.fetchSupported ? '✅ Поддерживается' : '❌ Не поддерживается'}</p>
              <p><strong>XMLHttpRequest:</strong> {diagnostics.network?.xhrSupported ? '✅ Поддерживается' : '❌ Не поддерживается'}</p>
              {diagnostics.network?.fetchStatus && (
                <p><strong>Статус загрузки:</strong> {diagnostics.network.fetchStatus}</p>
              )}
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Возможности:</h4>
            <div className="bg-gray-50 p-3 rounded text-sm">
              <p><strong>LocalStorage:</strong> {diagnostics.capabilities?.localStorageWorking ? '✅ Работает' : '❌ Не работает'}</p>
              <p><strong>SessionStorage:</strong> {diagnostics.capabilities?.sessionStorageWorking ? '✅ Работает' : '❌ Не работает'}</p>
              <p><strong>Iframe:</strong> {diagnostics.rendering?.iframeWorking ? '✅ Работает' : '❌ Не работает'}</p>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Рекомендации:</h4>
            <div className="bg-blue-50 p-3 rounded text-sm">
              {!diagnostics.network?.fetchSupported && diagnostics.network?.xhrSupported && (
                <p className="text-blue-700">• Используйте XMLHttpRequest вместо fetch</p>
              )}
              {!diagnostics.rendering?.iframeWorking && (
                <p className="text-blue-700">• Используйте прямое отображение HTML вместо iframe</p>
              )}
              {diagnostics.environment?.isWebView && (
                <p className="text-blue-700">• WebView обнаружен - используйте упрощенные методы</p>
              )}
            </div>
          </div>

          {/* Raw data */}
          <details className="mt-4">
            <summary className="cursor-pointer font-semibold text-gray-700">Показать полные данные</summary>
            <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
              {JSON.stringify(diagnostics, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};
