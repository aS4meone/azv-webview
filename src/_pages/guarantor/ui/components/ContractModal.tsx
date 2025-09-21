import React, { useState, useRef, useEffect } from "react";
import { ContractType } from "@/shared/models/types/guarantor-page";
import { HiXMark, HiDocumentText, HiExclamationTriangle } from "react-icons/hi2";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { Button, FastScrollbar } from "@/shared/ui";
import { Document, Page, pdfjs } from "react-pdf";
import { useTranslations } from "next-intl";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Инициализация PDF worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractType: ContractType;
  contractUrl: string;
  onSign: (contractType: ContractType) => void;
  isPreloading?: boolean;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  contractType,
  contractUrl,
  onSign,
  isPreloading = false,
}) => {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfError, setPdfError] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Сброс состояния при открытии модала
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setIsAgreed(false);
      setPdfError(false);
      setPdfLoaded(false);
    }
  }, [isOpen]);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px tolerance
      setHasScrolledToBottom(isAtBottom);
    }
  };

  const handleSign = async () => {
    setLoading(true);
    try {
      await onSign(contractType);
    } finally {
      setLoading(false);
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPdfError(false);
    setPdfLoaded(true);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setPdfError(true);
    setPdfLoaded(false);
  };

  if (!isOpen) return null;

  const getContractTitle = () => {
    return contractType === "guarantor" 
      ? t("guarantor.contractModal.guarantorContract")
      : t("guarantor.contractModal.subleaseContract");
  };

  const getContractDescription = () => {
    return contractType === "guarantor"
      ? t("guarantor.contractModal.guarantorDescription")
      : t("guarantor.contractModal.subleaseDescription");
  };

  return (
    <CustomPushScreen 
      isOpen={isOpen} 
      onClose={onClose}
      direction="right"
      withHeader={false}
      fullScreen={true}
      lockBodyScroll={false}
    >
      <div className="relative w-full h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 mt-[48px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#191919] flex items-center justify-center">
              <HiDocumentText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getContractTitle()}
            </h2>
          </div>
        </div>

        {/* Content */}
        <FastScrollbar
          scrollContainerRef={scrollRef}
          onScroll={handleScroll}
          className="w-full flex-1"
          scrollContainerClassName="h-full px-4"
        >
          <div className="max-w-4xl mx-auto py-6 pb-0">
            {pdfError ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <HiExclamationTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("guarantor.contractModal.contractLoadError")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("guarantor.contractModal.contractLoadErrorDescription")}
                </p>
                <a
                  href={contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-[#191919] text-white rounded-lg hover:bg-[#333333] transition-colors"
                >
                  {t("guarantor.contractModal.openInBrowser")}
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#F8F8F8] rounded-xl p-6">
                  <h4 className="font-semibold text-[#191919] mb-4">{t("guarantor.contractModal.contractTerms")}</h4>
                  <div className="text-sm text-[#191919] leading-relaxed space-y-4">
                    <p>
                      {getContractDescription()}
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600 text-center">
                        {t("guarantor.contractModal.readToEnd")}
                      </p>
                    </div>
                    <p>
                      {t("guarantor.contractModal.agreeToTerms")}
                    </p>
                  </div>
                </div>
                
                {contractUrl && (
                  <div className="border border-[#E5E5E5] rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-[#191919]">
                        {t("guarantor.contractModal.documentTitle")}
                      </span>
                      <div className="flex items-center gap-3">
                        {isPreloading && (
                          <div className="flex items-center gap-2 text-xs text-blue-600">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600"></div>
                            <span>Предзагрузка...</span>
                          </div>
                        )}
                        <a
                          href={contractUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#191919] hover:text-[#333333] text-sm font-medium transition-colors duration-200"
                        >
                          {t("guarantor.contractModal.openInNewTab")}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center py-4">
                      {pdfError ? (
                        <div className="flex flex-col items-center justify-center gap-4 py-12">
                          <HiExclamationTriangle className="w-12 h-12 text-red-500" />
                          <p className="text-red-600 font-medium">{t("guarantor.contractModal.contractLoadError")}</p>
                          <p className="text-gray-500 text-sm text-center">
                            {t("guarantor.contractModal.contractLoadErrorAlt")}
                          </p>
                        </div>
                      ) : (
                        <Document
                          file={contractUrl}
                          onLoadSuccess={onDocumentLoadSuccess}
                          onLoadError={onDocumentLoadError}
                          loading={
                            <div className="flex flex-col items-center justify-center gap-4 py-12">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#191919]"></div>
                              <p className="text-gray-600">{t("guarantor.contractModal.loadingContract")}</p>
                            </div>
                          }
                        >
                          {pdfLoaded && numPages > 0 && Array.from(new Array(numPages), (_, index) => (
                            <div key={`page_${index + 1}`} className="mb-4 shadow-lg">
                              <Page
                                pageNumber={index + 1}
                                width={Math.min(800, typeof window !== 'undefined' ? window.innerWidth - 100 : 700)}
                                className="border border-gray-200 rounded-lg"
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                                loading={
                                  <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#191919]"></div>
                                  </div>
                                }
                                error={
                                  <div className="flex items-center justify-center h-96 bg-red-50 rounded-lg">
                                    <p className="text-red-600 text-sm">Ошибка загрузки страницы {index + 1}</p>
                                  </div>
                                }
                              />
                            </div>
                          ))}
                        </Document>
                      )}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        </FastScrollbar>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200">
          {!hasScrolledToBottom && (
            <p className="text-xs text-gray-500 my-3 text-center">
              {t("guarantor.contractModal.readToSign")}
            </p>
          )}
          {hasScrolledToBottom && !isAgreed && (
            <p className="text-xs text-gray-500 my-3 text-center">
              {t("guarantor.contractModal.confirmAgreement")}
            </p>
          )}
          
          <div className="flex flex-col gap-4">
            {/* Checkbox section */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="agree"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="w-4 h-4 text-[#191919] bg-gray-100 border-gray-300 rounded focus:ring-[#191919] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="agree" className={`text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700'}`}>
                {t("guarantor.contractModal.agreeCheckbox")}
              </label>
            </div>
            
            {/* Buttons section with improved tablet layout */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-3 sm:gap-2 md:gap-3 lg:gap-2">
              <div className="flex gap-2 w-full sm:w-auto md:w-full lg:w-auto">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 sm:flex-none md:flex-1 lg:flex-none px-4 py-2 text-sm sm:text-sm md:text-base lg:text-sm"
                >
                  {t("guarantor.contractModal.cancel")}
                </Button>
                <Button
                  onClick={handleSign}
                  disabled={loading || !hasScrolledToBottom || !isAgreed}
                  className={`flex-1 sm:flex-none md:flex-1 lg:flex-none px-4 py-2 text-sm sm:text-sm md:text-base lg:text-sm ${
                    (loading || !hasScrolledToBottom || !isAgreed) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? t("guarantor.contractModal.signing") : t("guarantor.contractModal.signContract")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomPushScreen>
  );
};