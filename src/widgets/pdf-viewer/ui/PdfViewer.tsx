"use client";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState, useRef, useEffect } from "react";
import { Page, pdfjs, Document } from "react-pdf";
import PushScreen from "@/shared/ui/push-screen";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: string;
  onClose: () => void;
}

export const PDFViewer = ({ file, onClose }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState(700);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth - 32;
        setPageWidth(width > 0 ? width : 700);
      }
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <PushScreen withOutStyles>
      <div
        ref={containerRef}
        className="relative w-full h-screen flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-[60px] right-4 z-50 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-lg transition-colors"
          aria-label="Close PDF"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="flex-1 w-full h-full overflow-auto bg-gray-50">
          <div className="min-h-full flex flex-col items-center justify-start py-8 gap-4">
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className="my-react-pdf"
              loading={
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <svg
                    className="animate-spin h-5 w-5"
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
                  Loading PDF...
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
                  />
                </div>
              ))}
            </Document>
          </div>
        </div>
      </div>
    </PushScreen>
  );
};
