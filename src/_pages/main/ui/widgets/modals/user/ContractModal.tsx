"use client";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState, useRef, useEffect, useCallback } from "react";
import { Page, pdfjs, Document } from "react-pdf";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { Button } from "@/shared/ui";
import { cn } from "@/shared/utils/cn";
import { useTranslations } from "next-intl";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onReject: () => void;
  title?: string;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  onReject,
  title,
}) => {
  const t = useTranslations();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState(400);
  const [pageHeight, setPageHeight] = useState(400);

  const [pdfError, setPdfError] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;

        // Расчет ширины
        const maxWidth = Math.min(containerWidth - 48, 400);
        const minWidth = 280;
        setPageWidth(Math.max(maxWidth, minWidth));

        // Расчет высоты (максимум 80% от высоты контейнера)
        const maxHeight = Math.min(containerHeight * 0.8, 800);
        const minHeight = 400;
        setPageHeight(Math.max(maxHeight, minHeight));
      }
    };

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

    const debouncedResize = debounce(handleResize, 100);
    window.addEventListener("resize", debouncedResize);
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", debouncedResize);
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Debounce utility function
  const debounce = (func: (...args: unknown[]) => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: unknown[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Сбрасываем состояние при открытии модала
  useEffect(() => {
    if (isOpen) {
      setAgreed(false);
      setHasScrolledToEnd(false);

      setPdfError(false);
    }
  }, [isOpen]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);

    setPdfError(false);
  }

  function onDocumentLoadError(error: Error): void {
    console.error("PDF load error:", error);

    setPdfError(true);
  }

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

  const handleDownloadPDF = useCallback(() => {
    const link = document.createElement("a");
    link.href = "/docs/rent_doc.pdf";
    link.download = "rent_doc.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const handleOpenInBrowser = useCallback(() => {
    window.open("/docs/rent_doc.pdf", "_blank");
  }, []);

  if (pdfError) {
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
      <div
        ref={containerRef}
        className="relative w-full h-screen flex flex-col bg-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {title || t("widgets.modals.contract.title")}
          </h2>
        </div>

        {/* PDF Content */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="w-full overflow-auto px-4"
        >
          <div
            style={{ maxHeight: 550 }}
            className="flex flex-col items-center justify-start py-4 gap-4 max-w-lg mx-auto"
          >
            <Document
              file="/docs/rent_doc.pdf"
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
              }
            >
              {Array.from(new Array(numPages), (_, index) => (
                <div
                  key={`page_${index + 1}`}
                  className="mb-4 shadow-lg flex justify-center"
                >
                  <Page
                    pageNumber={index + 1}
                    width={pageWidth}
                    height={pageHeight}
                    className="border border-gray-200 max-w-full rounded-lg"
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                  />
                </div>
              ))}
            </Document>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onReject}
                className="flex-1 sm:flex-none px-4 py-2"
              >
                {t("widgets.modals.contract.reject")}
              </Button>
              <Button
                onClick={handleAccept}
                disabled={!agreed || !hasScrolledToEnd}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2",
                  (!agreed || !hasScrolledToEnd) &&
                    "opacity-50 cursor-not-allowed"
                )}
              >
                {t("widgets.modals.contract.accept")}
              </Button>
            </div>
          </div>
          {!hasScrolledToEnd && (
            <p className="text-xs text-gray-500 mt-2">
              {t("widgets.modals.contract.readToEnd")}
            </p>
          )}
        </div>
      </div>
    </CustomPushScreen>
  );
};
