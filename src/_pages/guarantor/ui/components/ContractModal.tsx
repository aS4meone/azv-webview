import React, { useState, useRef, useEffect } from "react";
import { ContractType } from "@/shared/models/types/guarantor-page";
import { HiXMark, HiDocumentText, HiExclamationTriangle } from "react-icons/hi2";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { Button } from "@/shared/ui";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface ContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractType: ContractType;
  contractUrl: string;
  onSign: (contractType: ContractType) => void;
}

export const ContractModal: React.FC<ContractModalProps> = ({
  isOpen,
  onClose,
  contractType,
  contractUrl,
  onSign,
}) => {
  const [loading, setLoading] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfError, setPdfError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Сброс состояния при открытии модала
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setIsAgreed(false);
      setPdfError(false);
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
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setPdfError(true);
  };

  if (!isOpen) return null;

  const getContractTitle = () => {
    return contractType === "guarantor" 
      ? "Договор гаранта" 
      : "Договор субаренды";
  };

  const getContractDescription = () => {
    return contractType === "guarantor"
      ? "Этот договор определяет ваши обязательства как гаранта перед клиентом."
      : "Этот договор определяет условия субаренды автомобиля.";
  };

  return (
    <CustomPushScreen 
      isOpen={isOpen} 
      onClose={onClose}
      direction="right"
      withHeader={false}
      fullScreen={true}
    >
      <div className="relative w-full h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#967642] flex items-center justify-center">
              <HiDocumentText className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              {getContractTitle()}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="w-full overflow-auto px-4 flex-1"
        >
          <div className="max-w-4xl mx-auto py-6">
            {pdfError ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                  <HiExclamationTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ошибка загрузки договора
                </h3>
                <p className="text-gray-600 mb-4">
                  Не удалось загрузить документ. Попробуйте открыть его в браузере.
                </p>
                <a
                  href={contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-[#967642] text-white rounded-lg hover:bg-[#B8860B] transition-colors"
                >
                  Открыть в браузере
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-[#F8F8F8] rounded-xl p-6">
                  <h4 className="font-semibold text-[#2D2D2D] mb-4">Условия договора:</h4>
                  <div className="text-sm text-[#666666] leading-relaxed space-y-4">
                    <p>
                      {getContractDescription()}
                    </p>
                    <p>
                      Нажимая "Подписать", вы соглашаетесь с условиями данного договора.
                    </p>
                  </div>
                </div>
                
                {contractUrl && (
                  <div className="border border-[#E5E5E5] rounded-xl p-4 bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium text-[#666666]">
                        Документ договора:
                      </span>
                      <a
                        href={contractUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#967642] hover:text-[#B8860B] text-sm font-medium transition-colors duration-200"
                      >
                        Открыть в новой вкладке
                      </a>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center py-4">
                      <Document
                        file={contractUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={onDocumentLoadError}
                        loading={
                          <div className="flex flex-col items-center justify-center gap-4 py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#967642]"></div>
                            <p className="text-gray-600">Загрузка договора...</p>
                          </div>
                        }
                      >
                        {Array.from(new Array(numPages), (_, index) => (
                          <div key={`page_${index + 1}`} className="mb-4 shadow-lg">
                            <Page
                              pageNumber={index + 1}
                              width={Math.min(800, window.innerWidth - 100)}
                              className="border border-gray-200 rounded-lg"
                              renderTextLayer={true}
                              renderAnnotationLayer={true}
                            />
                          </div>
                        ))}
                      </Document>
                    </div>
                  </div>
                )}

                {!hasScrolledToBottom && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <HiExclamationTriangle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Пожалуйста, прочитайте весь договор до конца, чтобы продолжить
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <input
                type="checkbox"
                id="agree"
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                disabled={!hasScrolledToBottom}
                className="w-4 h-4 text-[#967642] bg-gray-100 border-gray-300 rounded focus:ring-[#967642] focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <label htmlFor="agree" className={`text-sm ${!hasScrolledToBottom ? 'text-gray-400' : 'text-gray-700'}`}>
                Я прочитал весь договор и согласен с условиями
              </label>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2"
              >
                Отмена
              </Button>
              <Button
                onClick={handleSign}
                disabled={loading || !hasScrolledToBottom || !isAgreed}
                className="flex-1 sm:flex-none px-4 py-2"
              >
                {loading ? "Подписание..." : "Подписать договор"}
              </Button>
            </div>
          </div>
          {!hasScrolledToBottom && (
            <p className="text-xs text-gray-500 mt-2">
              Для принятия договора необходимо прочитать весь документ
            </p>
          )}
          {hasScrolledToBottom && !isAgreed && (
            <p className="text-xs text-gray-500 mt-2">
              Пожалуйста, подтвердите согласие с условиями договора
            </p>
          )}
        </div>
      </div>
    </CustomPushScreen>
  );
};