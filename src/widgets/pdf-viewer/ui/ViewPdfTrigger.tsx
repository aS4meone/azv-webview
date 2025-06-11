"use client";

import { PDFViewer } from "@/widgets/pdf-viewer";
import { ReactNode, useState } from "react";

interface IViewPdfTrigger {
  children: ReactNode;
  url: string;
  className?: string;
}

const ViewPdfTrigger = ({ children, url, className }: IViewPdfTrigger) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={className}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {children}
      </button>

      {open && <PDFViewer file={url} onClose={() => setOpen(false)} />}
    </>
  );
};

export default ViewPdfTrigger;
