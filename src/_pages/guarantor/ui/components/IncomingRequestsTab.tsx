import React, { useState } from "react";
import { IncomingRequest, SimpleClient } from "@/shared/models/types/guarantor";
import { ContractType } from "@/shared/models/types/guarantor-page";
import { HiClipboardDocumentList, HiUsers, HiCheckCircle, HiXCircle, HiDocumentText, HiExclamationTriangle } from "react-icons/hi2";
import { useTranslations } from "next-intl";

interface IncomingRequestsTabProps {
  requests: IncomingRequest[];
  clients: SimpleClient[];
  onAccept: (requestId: number) => void;
  onReject: (requestId: number, reason?: string) => void;
  onViewContract: (contractType: ContractType, relationshipId: number) => void;
}

export const IncomingRequestsTab: React.FC<IncomingRequestsTabProps> = ({
  requests,
  clients,
  onAccept,
  onReject,
  onViewContract,
}) => {
  const t = useTranslations();
  const [rejectReason, setRejectReason] = useState<string>("");
  const [showRejectModal, setShowRejectModal] = useState<number | null>(null);

  const handleReject = (requestId: number) => {
    onReject(requestId, rejectReason || undefined);
    setShowRejectModal(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      {/* Новые заявки - показываем только если есть заявки */}
      {requests.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-[#191919] flex items-center justify-center">
              <HiClipboardDocumentList className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#191919]">
              {t("guarantor.incomingRequests.title")}
              {requests.length > 0 && (
                <span className="ml-2 px-2 py-1 bg-[#191919] text-white text-xs font-medium rounded-full">
                  {requests.length}
                </span>
              )}
            </h2>
          </div>
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-[#F8F8F8] rounded-2xl p-4 w-full"
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {request.requestor_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#191919] text-lg truncate">
                        {request.requestor_name || t("guarantor.incomingRequests.notSpecified")}
                      </h3>
                      <p className="text-sm text-[#191919] truncate">
                        {request.requestor_phone}
                      </p>
                    </div>
                  </div>
                </div>
                {request.reason && (
                  <div className="mt-3">
                    <div className="bg-[#F8F8F8] rounded-lg p-3">
                      <p className="text-sm text-[#191919]">
                        <span className="font-medium">{t("guarantor.incomingRequests.reason")}</span> {request.reason}
                      </p>
                    </div>
                  </div>
                )}
                <div className="mt-3 w-full">
                    <p className="text-xs text-[#191919] mb-2">
                      {new Date(request.created_at).toLocaleString("ru-RU")}
                    </p>
                  <div className="flex flex-col space-y-2 flex-shrink-0">
                    <button
                      onClick={() => onAccept(request.id)}
                      className="px-3 py-3 bg-[#2E7D32] text-white text-xs font-semibold rounded-lg hover:bg-[#4CAF50] transition-all duration-300  flex items-center justify-center gap-1 whitespace-nowrap"
                    >
                      <HiCheckCircle className="w-3 h-3" />
                      {t("guarantor.incomingRequests.accept")}
                    </button>
                    <button
                      onClick={() => setShowRejectModal(request.id)}
                      className="px-3 py-3 bg-[#D32F2F] text-white text-xs font-semibold rounded-lg hover:bg-[#F44336] transition-all duration-300  flex items-center justify-center gap-1 whitespace-nowrap"
                    >
                      <HiXCircle className="w-3 h-3" />
                      {t("guarantor.incomingRequests.reject")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Мои клиенты */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#191919] flex items-center justify-center">
            <HiUsers className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-base font-semibold text-[#191919]">
            {t("guarantor.incomingRequests.myClients")}
            {clients.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-[#191919] text-white text-xs font-medium rounded-full">
                {clients.length}
              </span>
            )}
          </h2>
        </div>
        {clients.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#191919] flex items-center justify-center">
              <HiUsers className="w-12 h-12 text-white" />
            </div>
            <p className="text-[#191919] text-lg font-semibold mb-2">{t("guarantor.incomingRequests.noClients")}</p>
            <p className="text-[#191919] text-sm">{t("guarantor.incomingRequests.noClientsDescription")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {clients.map((client) => (
              <div
                key={client.id}
                className="bg-[#F8F8F8] rounded-2xl p-4 w-full"
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {(client.first_name || client.last_name)?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#191919] text-lg truncate">
                        {client.first_name && client.last_name 
                          ? `${client.first_name} ${client.last_name}`
                          : client.first_name || client.last_name || t("guarantor.incomingRequests.notSpecified")
                        }
                      </h3>
                      <p className="text-sm text-[#191919] truncate">
                        {client.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  
                  <div className="flex flex-col space-y-2 flex-shrink-0 w-full">
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium flex items-center justify-center gap-1 whitespace-nowrap ${
                        client.contract_signed
                          ? "bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20"
                          : "bg-[#FF9800]/10 text-[#FF9800] border border-[#FF9800]/20"
                      }`}
                    >
                      <HiDocumentText className="w-3 h-3" />
                      {client.contract_signed ? t("guarantor.incomingRequests.contractSigned") : t("guarantor.incomingRequests.contractNotSigned")}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium flex items-center justify-center gap-1 whitespace-nowrap ${
                        client.sublease_contract_signed
                          ? "bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20"
                          : "bg-[#FF9800]/10 text-[#FF9800] border border-[#FF9800]/20"
                      }`}
                    >
                      <HiDocumentText className="w-3 h-3" />
                      {client.sublease_contract_signed ? t("guarantor.incomingRequests.subleaseSigned") : t("guarantor.incomingRequests.subleaseNotSigned")}
                    </span>
                    {!client.contract_signed && (
                      <button
                        onClick={() => onViewContract("guarantor", client.id)}
                        className="px-3 py-2 bg-[#191919] text-white text-xs font-semibold rounded-lg hover:bg-[#333333] transition-all duration-300  whitespace-nowrap"
                      >
                        {t("guarantor.incomingRequests.signContract")}
                      </button>
                    )}
                    {client.contract_signed && !client.sublease_contract_signed && (
                      <button
                        onClick={() => onViewContract("sublease", client.id)}
                        className="px-3 py-2 bg-[#2196F3] text-white text-xs font-semibold rounded-lg hover:bg-[#1976D2] transition-all duration-300  whitespace-nowrap"
                      >
                        {t("guarantor.incomingRequests.signSublease")}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно отклонения */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#D32F2F] flex items-center justify-center">
                <HiExclamationTriangle className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold text-[#191919]">
                {t("guarantor.rejectModal.title")}
              </h3>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-[#191919] mb-2">
                {t("guarantor.rejectModal.reasonLabel")}
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919] transition-all duration-300 resize-none"
                rows={3}
                placeholder={t("guarantor.rejectModal.reasonPlaceholder")}
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-3 border border-[#E5E5E5] text-[#191919] rounded-xl hover:bg-[#F8F8F8] transition-all duration-300 font-medium"
              >
                {t("guarantor.rejectModal.cancel")}
              </button>
              <button
                onClick={() => handleReject(showRejectModal)}
                className="flex-1 px-4 py-3 bg-[#D32F2F] text-white rounded-xl hover:bg-[#F44336] transition-all duration-300 font-semibold "
              >
                {t("guarantor.rejectModal.reject")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
