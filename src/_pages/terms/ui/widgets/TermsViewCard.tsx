"use client";

import { ArrowRightIcon } from "@/shared/icons";
import { useState } from "react";
import { TermsContent } from "./TermsContent";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { IconType } from "react-icons";

interface ITermsViewCard {
  title: string;
  contentKey: string;
  icon?: IconType;
  description?: string;
}

const TermsViewCard = ({ title, contentKey, icon: Icon, description }: ITermsViewCard) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full group"
      >
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-300 group-hover:scale-[1.02]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Icon */}
              <div className="w-12 h-12 rounded-xl bg-[#191919] flex items-center justify-center flex-shrink-0 shadow-md group-hover:shadow-lg transition-all duration-300">
                {Icon ? (
                  <Icon className="w-6 h-6 text-white" />
                ) : (
                  <div className="w-6 h-6 bg-white/20 rounded-full" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-[#191919] mb-1 group-hover:text-[#333333] transition-colors duration-200">
                  {title}
                </h3>
                {description && (
                  <p className="text-sm text-[#666666] line-clamp-2">
                    {description}
                  </p>
                )}
              </div>
            </div>
            
            {/* Arrow */}
            <div className="ml-4 flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[#191919] group-hover:text-white transition-all duration-300">
                <ArrowRightIcon className="w-4 h-4 text-[#191919] group-hover:text-white transition-colors duration-300" />
              </div>
            </div>
          </div>
        </div>
      </button>

      <CustomPushScreen
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        direction="bottom"
        height="auto"
      >
        <TermsContent contentKey={contentKey} />
      </CustomPushScreen>
    </>
  );
};

export default TermsViewCard;
