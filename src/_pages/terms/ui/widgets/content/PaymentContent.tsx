"use client";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState, useRef, useEffect } from "react";
import { Page, pdfjs, Document } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export const PaymentContent = () => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState(700);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfError, setPdfError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth - 32;
        setPageWidth(width > 0 ? width : 700);
      }
    }

    const checkMobile = () => {
      const isMobileDevice =
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    handleResize();
    checkMobile();
    window.addEventListener("resize", handleResize);
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    setIsLoading(false);
    setPdfError(false);
  }

  function onDocumentLoadError(error: Error): void {
    console.error("PDF load error:", error);
    setIsLoading(false);
    setPdfError(true);
  }

  const handleDownloadPDF = () => {
    const link = document.createElement("a");
    link.href = "/docs/online_payment.pdf";
    link.download = "online_payment.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInBrowser = () => {
    window.open("/docs/online_payment.pdf", "_blank");
  };

  if (pdfError) {
    return (
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
              Ошибка загрузки PDF
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {isMobile
                ? "Не удалось загрузить документ. Попробуйте открыть его в браузере."
                : "Возможно, документ временно недоступен. Попробуйте позже или скачайте файл."}
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
              {isMobile ? "Открыть в браузере" : "Открыть в новой вкладке"}
            </button>
            <button
              onClick={handleDownloadPDF}
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
              Скачать PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex flex-col bg-gray-50"
    >
      <div className="h-10"></div>
      <div className="flex-1 w-full overflow-auto">
        <div className="min-h-full flex flex-col items-center justify-start py-4 gap-4">
          <Document
            file="/docs/online_payment.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            className="my-react-pdf"
            loading={
              <div className="flex flex-col items-center justify-center gap-4 py-12">
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
                  <span className="text-lg">Загрузка документа...</span>
                </div>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                  Документ об условиях онлайн оплаты
                </p>
                {isMobile && (
                  <div className="mt-4 space-y-2 text-center">
                    <p className="text-xs text-gray-500">
                      Если загрузка занимает много времени:
                    </p>
                    <button
                      onClick={handleOpenInBrowser}
                      className="text-[#1D77FF] text-xs underline"
                    >
                      Открыть в браузере
                    </button>
                  </div>
                )}
              </div>
            }
          >
            {Array.from(new Array(numPages), (el, index) => (
              <div
                key={`page_${index + 1}`}
                className="mb-4 shadow-lg flex justify-center"
              >
                <Page
                  pageNumber={index + 1}
                  width={pageWidth}
                  className="border border-gray-200 max-w-full"
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};
