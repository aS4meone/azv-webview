"use client";

import { ArrowRightIcon } from "@/shared/icons";
import { useState } from "react";
import PushScreen from "@/shared/ui/push-screen";
import { TermsContent } from "./TermsContent";

interface ITermsViewCard {
  title: string;
  contentKey: string;
}

const TermsViewCard = ({ title, contentKey }: ITermsViewCard) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="pb-4 w-full flex items-center justify-between border-b border-[#DADADA] px-1 cursor-pointer"
      >
        <p className="text-[18px] text-[#191919] text-left">{title}</p>
        <ArrowRightIcon />
      </button>

      {isOpen && (
        <PushScreen onClose={() => setIsOpen(false)} withCloseButton>
          <TermsContent contentKey={contentKey} />
        </PushScreen>
      )}
    </>
  );
};

export default TermsViewCard;
