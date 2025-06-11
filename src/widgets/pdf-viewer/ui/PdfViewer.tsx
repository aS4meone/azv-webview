"use client";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState, useRef, useEffect } from "react";
import { Page, pdfjs, Document } from "react-pdf";
import { ArrowLeftIcon, ArrowRightIcon } from "@/shared/icons";
import PushScreen from "@/shared/ui/push-screen";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  file: string;
  onClose: () => void;
}

export const PDFViewer = ({ file, onClose }: PDFViewerProps) => {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
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
    setPageNumber(1);
  }

  function nextPage() {
    setPageNumber((v) => Math.min(v + 1, numPages));
  }
  function prevPage() {
    setPageNumber((v) => Math.max(v - 1, 1));
  }
  function goToPage(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= numPages) {
      setPageNumber(val);
    }
  }

  return (
    <PushScreen withOutStyles>
      <div
        ref={containerRef}
        className="relative w-full h-screen flex flex-col"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-lg transition-colors"
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

        <div className="flex-1 w-full h-full flex items-center justify-center overflow-auto bg-gray-50">
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
            <Page pageNumber={pageNumber} width={pageWidth} />
          </Document>
        </div>

        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-2">
          <div className="flex items-center gap-2 w-full justify-center">
            <button
              onClick={prevPage}
              disabled={pageNumber <= 1}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ArrowLeftIcon />
            </button>
            <div className="flex items-center gap-1 px-1 text-[12px]">
              <input
                type="number"
                min={1}
                max={numPages}
                value={pageNumber}
                onChange={goToPage}
                readOnly
                className=" text-center border border-gray-200 rounded-md px-1 py-1 text-gray-700"
              />
              <span className="text-gray-700 text-nowrap">из {numPages}</span>
            </div>
            <button
              onClick={nextPage}
              disabled={pageNumber >= numPages}
              className="p-2 text-gray-700 hover:bg-gray-100 rounded-full disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <ArrowRightIcon />
            </button>
          </div>
          {/* <div className="w-px h-6 bg-gray-200"></div>
          <button
            onClick={downloadPDF}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Download PDF"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button> */}
        </div>
      </div>
    </PushScreen>
  );
};
