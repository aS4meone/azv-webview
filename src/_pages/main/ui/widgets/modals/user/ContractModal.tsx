"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import { useTranslations } from "next-intl";

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  title?: string;
  // Client data for filling the agreement
  full_name?: string;
  login?: string;
  client_id?: string;
  digital_signature?: string;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onReject,
  title,
  full_name = "Meyirman Sarsenbay",
  login = "meyirman_azv",
  client_id = "2319",
  digital_signature = "13241",
}) => {
  const t = useTranslations();
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isWebView, setIsWebView] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const [zoom, setZoom] = useState(0.3); // Default 30% for all devices

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState<number>(2500);
  const [iframeLoadError, setIframeLoadError] = useState(false);

  // Load and fill HTML
  useEffect(() => {
    const loadAndFillHTML = async () => {
      try {
        setLoading(true);
        setError(false);

        console.log('🔄 Loading HTML file from:', '/docs/new/accession_agreement.html');
        console.log('🔍 WebView environment:', {
          isWebView,
          userAgent: navigator.userAgent,
          hasReactNativeWebView: !!(window as any).ReactNativeWebView,
          hasWebKitHandlers: !!(window as any).webkit?.messageHandlers
        });

        // For WebView, try different approaches
        let response;
        try {
          response = await fetch('/docs/new/accession_agreement.html', {
            method: 'GET',
            headers: {
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Cache-Control': 'no-cache',
            },
            cache: 'no-cache'
          });
        } catch (fetchError) {
          console.error('❌ Fetch error:', fetchError);
          // Try alternative approach for WebView
          if (isWebView) {
            console.log('🔄 Trying XMLHttpRequest for WebView');
            try {
              const xhrResponse = await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', '/docs/new/accession_agreement.html', true);
                xhr.setRequestHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8');
                xhr.setRequestHeader('Cache-Control', 'no-cache');
                
                xhr.onreadystatechange = function() {
                  if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                      console.log('✅ XMLHttpRequest success');
                      resolve(xhr.responseText);
                    } else {
                      console.error('❌ XMLHttpRequest error:', xhr.status, xhr.statusText);
                      reject(new Error(`XMLHttpRequest failed: ${xhr.status} ${xhr.statusText}`));
                    }
                  }
                };
                
                xhr.onerror = function() {
                  console.error('❌ XMLHttpRequest network error');
                  reject(new Error('XMLHttpRequest network error'));
                };
                
                xhr.send();
              });
              
              response = {
                ok: true,
                status: 200,
                statusText: 'OK',
                text: () => Promise.resolve(xhrResponse),
                headers: new Headers()
              } as any;
              
              console.log('✅ XMLHttpRequest loaded HTML, length:', xhrResponse.length);
            } catch (xhrError) {
              console.error('❌ XMLHttpRequest also failed:', xhrError);
              throw new Error('Both fetch and XMLHttpRequest failed in WebView');
            }
          } else {
            throw fetchError;
          }
        }
        
        console.log('📡 Response status:', response.status, response.statusText);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          throw new Error(`Failed to load HTML file: ${response.status} ${response.statusText}`);
        }

        let html = await response.text();
        console.log('📄 HTML loaded, length:', html.length);
        console.log('📄 HTML preview (first 200 chars):', html.substring(0, 200));
        
        // Additional validation for WebView
        if (isWebView && (!html || html.length < 100)) {
          console.warn('⚠️ HTML content seems too short for WebView, might be incomplete');
        }

        // Replace placeholders with actual data
        html = html.replace(/\$\{full_name\}/g, full_name);
        html = html.replace(/\$\{login\}/g, login);
        html = html.replace(/\$\{client_id\}/g, client_id);
        html = html.replace(/\$\{digital_signature\}/g, digital_signature);

        // Add viewport meta tag and responsive styles if not present
        if (!html.includes('viewport')) {
          html = html.replace(
            '<head>',
            `<head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes, viewport-fit=cover">
              <style>
                * {
                  box-sizing: border-box;
                }
                html, body {
                  margin: 0;
                  padding: 0;
                  width: 100%;
                  height: 100%;
                  overflow-x: hidden;
                  overflow-y: auto;
                  -webkit-overflow-scrolling: touch; /* iOS smooth scrolling */
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }
                body {
                  padding: 16px;
                  line-height: 1.6;
                  font-size: 16px; /* iOS minimum readable font size */
                }
                /* iOS-optimized scrollbar */
                ::-webkit-scrollbar {
                  width: 8px;
                  height: 8px;
                }
                ::-webkit-scrollbar-track {
                  background: transparent;
                }
                ::-webkit-scrollbar-thumb {
                  background: rgba(0,0,0,0.3);
                  border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                  background: rgba(0,0,0,0.5);
                }
                /* Touch-friendly elements */
                button, input, select, textarea {
                  font-size: 16px; /* Prevent zoom on iOS */
                  touch-action: manipulation;
                }
                /* Ensure text is selectable on iOS */
                p, div, span, td, th {
                  -webkit-user-select: text;
                  user-select: text;
                }
                /* Fix for iOS iframe rendering */
                img {
                  max-width: 100%;
                  height: auto;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                }
                /* iOS-specific fixes */
                @supports (-webkit-touch-callout: none) {
                  body {
                    -webkit-text-size-adjust: 100%;
                    -webkit-font-smoothing: antialiased;
                  }
                }
                /* WebView-specific fixes */
                @media screen and (-webkit-min-device-pixel-ratio: 0) {
                  body {
                    -webkit-transform: translateZ(0);
                    transform: translateZ(0);
                  }
                }
                /* Force hardware acceleration for WebView */
                .webview-optimized {
                  -webkit-transform: translate3d(0,0,0);
                  transform: translate3d(0,0,0);
                  -webkit-backface-visibility: hidden;
                  backface-visibility: hidden;
                }
              </style>`
          );
        }

        setHtmlContent(html);
        setLoading(false);
        console.log('✅ HTML content set successfully');
      } catch (err) {
        console.error('❌ Error loading HTML:', err);
        
        // Show error for any failure to load the original HTML file
        console.error('❌ Failed to load accession_agreement.html:', err);
        setError(true);
        setLoading(false);
      }
    };

    if (isOpen) {
      loadAndFillHTML();
    }
  }, [isOpen, full_name, login, client_id, digital_signature, isWebView]);

  // Auto-adjust iframe height based on content
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !htmlContent) return;

    const adjustHeight = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc && iframeDoc.body) {
          // Get the actual content height
          const contentHeight = Math.max(
            iframeDoc.body.scrollHeight,
            iframeDoc.documentElement.scrollHeight,
            iframeDoc.body.offsetHeight,
            iframeDoc.documentElement.offsetHeight
          );
          setIframeHeight(contentHeight + 50); // Add some padding
        }
      } catch (err) {
        console.error('Error adjusting iframe height:', err);
        // Fallback to default height if we can't access iframe content
        setIframeHeight(2500);
      }
    };

    // Wait for iframe to load
    iframe.addEventListener('load', adjustHeight);
    
    // Also try to adjust after a short delay (in case load event doesn't fire)
    const timer = setTimeout(adjustHeight, 500);
    // Also adjust on zoom change
    const zoomTimer = setTimeout(adjustHeight, 100);

    return () => {
      iframe.removeEventListener('load', adjustHeight);
      clearTimeout(timer);
      clearTimeout(zoomTimer);
    };
  }, [htmlContent, zoom]);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isSmallScreen = window.innerWidth <= 768;
      const mobile = isMobileDevice || isSmallScreen;
      setIsMobile(mobile);
      
      // Check if running in WebView (iOS/Android app)
      const isInWebView = !!(window as any).ReactNativeWebView || 
                         !!(window as any).webkit?.messageHandlers ||
                         /wv|WebView/i.test(navigator.userAgent);
      setIsWebView(isInWebView);
      
      console.log('🔍 Device detection:', {
        isMobile: mobile,
        isWebView: isInWebView,
        userAgent: navigator.userAgent,
        hasReactNativeWebView: !!(window as any).ReactNativeWebView,
        hasWebKitHandlers: !!(window as any).webkit?.messageHandlers
      });
      
      // Keep zoom at 30% for all devices (WebView compatibility)
      setZoom(0.3);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAgreed(false);
      setHasScrolledToEnd(false);
      setError(false);
      setIframeLoadError(false);
    }
  }, [isOpen]);

  const handleAccept = useCallback(() => {
    if (agreed) {
      onAccept();
    }
  }, [agreed, onAccept]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isScrolledToEnd = scrollTop + clientHeight >= scrollHeight - 20;
      setHasScrolledToEnd(isScrolledToEnd);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.1, 2)); // Max 200%
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.1, 0.3)); // Min 30% for all devices
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(0.3); // Reset to 30% for all devices
  }, []);

  const handleDownloadHTML = useCallback(() => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'accession_agreement.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [htmlContent]);

  const handleOpenInBrowser = useCallback(() => {
    window.open("/docs/new/accession_agreement.html", "_blank");
  }, []);

  if (error) {
    return (
      <CustomPushScreen isOpen={isOpen} onClose={onClose}>
        <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("widgets.modals.contract.contractLoadError")}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {isMobile
                  ? t("widgets.modals.contract.contractLoadErrorDescription")
                  : t("widgets.modals.contract.contractLoadErrorDescription")}
              </p>
            </div>
            <div className="space-y-3">
              <button
                onClick={handleOpenInBrowser}
                className="w-full px-6 py-3 bg-[#1D77FF] hover:bg-[#1D77FF]/90 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
                {t("widgets.modals.contract.openInBrowser")}
              </button>
              <button
                onClick={handleDownloadHTML}
                className="w-full px-6 py-3 border border-[#1D77FF] text-[#1D77FF] hover:bg-[#1D77FF]/5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {t("widgets.modals.contract.downloadPDF")}
              </button>
            </div>
          </div>
        </div>
      </CustomPushScreen>
    );
  }

  return (
    <CustomPushScreen isOpen={isOpen} onClose={onClose}>
      <div className="relative w-full flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {title || t("widgets.modals.contract.title")}
          </h2>
        </div>

        {/* HTML Content */}
        <div className="flex-1 overflow-hidden relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 h-full">
              <div className="flex items-center gap-3 text-gray-600">
                <svg
                  className="animate-spin h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span className="text-lg">{t("widgets.modals.contract.loadingContract")}</span>
              </div>
              <p className="text-gray-500 text-sm text-center max-w-xs">
                {t("widgets.modals.contract.documentDescription")}
              </p>
              {isMobile && (
                <div className="mt-4 space-y-2 text-center">
                  <p className="text-xs text-gray-500">
                    {t("widgets.modals.contract.ifLoadingTakesLong")}
                  </p>
                  <button
                    onClick={handleOpenInBrowser}
                    className="text-[#1D77FF] text-xs underline"
                  >
                    {t("widgets.modals.contract.openInBrowser")}
                  </button>
                </div>
              )}
            </div>
          ) : iframeLoadError ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12 h-full">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Проблема с отображением документа</h3>
                <p className="text-gray-600 text-sm">Попробуйте открыть документ в браузере</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleOpenInBrowser}
                    className="px-4 py-2 bg-[#1D77FF] text-white rounded-lg text-sm"
                  >
                    Открыть в браузере
                  </button>
                  <button
                    onClick={() => {
                      setIframeLoadError(false);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm"
                  >
                    Попробовать снова
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Zoom Controls */}
              <div className="sticky top-0 z-10 bg-white border-b border-gray-200 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                    title="Уменьшить"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-gray-700 min-w-[60px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition-colors"
                    title="Увеличить"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700 transition-colors"
                    title="Сбросить"
                  >
                    Сбросить
                  </button>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  {isWebView ? "Проведите пальцем для прокрутки" : isMobile ? "Проведите пальцем для прокрутки" : "Используйте колесо мыши для прокрутки"}
                </div>
              </div>

              {/* Document Container */}
              <div 
                ref={scrollContainerRef}
                className="w-full h-full p-4 max-h-[850px]"
                onScroll={handleScroll}
                style={{
                  WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
                }}
              >
                <div
                  style={{
                    transform: `scale(${zoom})`,
                    transformOrigin: 'top left',
                    width: `${100 / zoom}%`,
                    minHeight: isMobile ? '100vh' : 'auto', // Ensure full height on mobile
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    srcDoc={htmlContent}
                    className={`w-full ${isWebView ? 'webview-optimized' : ''}`}
                    style={{ 
                      height: `${iframeHeight}px`,
                      border: 'none',
                      display: 'block',
                      WebkitOverflowScrolling: 'touch', // iOS smooth scrolling
                      ...(isWebView && {
                        // WebView-specific optimizations
                        transform: 'translate3d(0,0,0)',
                        WebkitTransform: 'translate3d(0,0,0)',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      })
                    }}
                    title="Filled Agreement Document"
                    sandbox="allow-same-origin allow-scripts allow-forms"
                    allow="fullscreen"
                    onError={() => {
                      console.error('❌ Iframe load error');
                      setIframeLoadError(true);
                    }}
                    onLoad={() => {
                      console.log('✅ Iframe loaded successfully');
                      setIframeLoadError(false);
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 bg-white border-t border-gray-200 relative z-10">
          {!hasScrolledToEnd && (
            <p className="text-xs text-gray-500 my-3">
              {t("widgets.modals.contract.readToEnd")}
            </p>
          )}
          <div className="flex flex-col gap-4">
            {/* Checkbox section */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-4 h-4 text-[#1D77FF] bg-gray-100 border-gray-300 rounded focus:ring-[#1D77FF] focus:ring-2"
              />
              <label htmlFor="agree" className="text-sm text-gray-700">
                {t("widgets.modals.contract.agreeToTerms")}
              </label>
            </div>

            {/* Buttons section */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 sm:gap-2 md:gap-3 lg:gap-2">
              <div className="flex gap-2 w-full sm:w-auto md:w-full lg:w-auto">
                <Button
                  variant="outline"
                  onClick={onReject}
                  className="flex-1 sm:flex-none md:flex-1 lg:flex-none px-4 py-2 text-sm sm:text-sm md:text-base lg:text-sm"
                >
                  {t("widgets.modals.contract.reject")}
                </Button>
                <Button
                  onClick={handleAccept}
                  disabled={!agreed || !hasScrolledToEnd}
                  className={cn(
                    "flex-1 sm:flex-none md:flex-1 lg:flex-none px-4 py-2 text-sm sm:text-sm md:text-base lg:text-sm",
                    (!agreed || !hasScrolledToEnd) &&
                    "opacity-50 cursor-not-allowed"
                  )}
                >
                  {t("widgets.modals.contract.accept")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomPushScreen>
  );
};
