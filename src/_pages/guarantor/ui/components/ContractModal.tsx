import React, { useState } from "react";
import { ContractType } from "@/shared/models/types/guarantor-page";
import { HiXMark, HiDocumentText, HiExclamationTriangle } from "react-icons/hi2";

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

  if (!isOpen) return null;

  const handleSign = async () => {
    setLoading(true);
    try {
      await onSign(contractType);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#967642] flex items-center justify-center">
              <HiDocumentText className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#2D2D2D]">
              {getContractTitle()}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#666666] transition-colors duration-200"
          >
            <HiXMark className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <p className="text-sm text-[#666666] leading-relaxed">
            {getContractDescription()}
          </p>
          
          {contractUrl ? (
            <div className="border border-[#E5E5E5] rounded-xl p-4 bg-[#F8F8F8]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#666666]">
                  Документ для просмотра:
                </span>
                <a
                  href={contractUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#967642] hover:text-[#B8860B] text-sm font-medium underline transition-colors duration-200"
                >
                  Открыть в новой вкладке
                </a>
              </div>
              <iframe
                src={contractUrl}
                className="w-full h-96 border border-[#E5E5E5] rounded-lg"
                title={getContractTitle()}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                <HiDocumentText className="w-10 h-10 text-[#967642]" />
              </div>
              <p className="text-[#666666] text-lg font-medium">Загрузка документа...</p>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-[#FFF3CD] to-[#FEF3C7] border border-[#FDE68A] rounded-xl p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#F59E0B] flex items-center justify-center">
                  <HiExclamationTriangle className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-[#92400E]">
                  Внимание
                </h4>
                <p className="text-sm text-[#92400E] mt-1 leading-relaxed">
                  Пожалуйста, внимательно прочитайте договор перед подписанием. 
                  Подписание договора означает ваше согласие со всеми условиями.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-[#E5E5E5] text-[#666666] rounded-xl hover:bg-[#F8F8F8] transition-all duration-300 font-medium"
          >
            Отмена
          </button>
          <button
            onClick={handleSign}
            disabled={loading || !contractUrl}
            className="flex-1 px-4 py-3 bg-[#967642] text-white rounded-xl hover:bg-[#B8860B] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {loading ? "Подписание..." : "Подписать договор"}
          </button>
        </div>
      </div>
    </div>
  );
};
