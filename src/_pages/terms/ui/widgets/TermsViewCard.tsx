"use client";

import { ArrowRightIcon } from "@/shared/icons";

import { PDFViewer } from "@/widgets/pdf-viewer";
import { useState } from "react";

interface ITermsViewCard {
  title: string;
  url: string;
}

const TermsViewCard = ({ title, url }: ITermsViewCard) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="pb-4 w-full flex items-center justify-between border-b border-[#DADADA] px-1 cursor-pointer"
      >
        <p className="text-[18px] text-[#191919]">{title}</p>
        <ArrowRightIcon />
      </button>

      {open && <PDFViewer file={url} onClose={() => setOpen(false)} />}
    </>
  );
};

export default TermsViewCard;
