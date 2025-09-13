"use client";

import React, { useState, useEffect } from "react";
import { useUserStore } from "@/shared/stores/userStore";
import { UserRole } from "@/shared/models/types/user";
import { guarantorApi } from "@/shared/api/routes/guarantor";
import { IncomingRequest, SimpleGuarantor, SimpleClient, ClientGuarantorRequestItem } from "@/shared/models/types/guarantor";
import { 
  GuarantorTabs, 
  IncomingRequestsTab, 
  MyGuarantorsTab, 
  HelpModal, 
  ContractModal 
} from "./components";
import { ContractType } from "@/shared/models/types/guarantor-page";
import { HiX, HiQuestionMarkCircle } from "react-icons/hi";

export const GuarantorPage: React.FC = () => {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<"incoming" | "my_guarantors">("incoming");
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [myGuarantors, setMyGuarantors] = useState<SimpleGuarantor[]>([]);
  const [myClients, setMyClients] = useState<SimpleClient[]>([]);
  const [myGuarantorRequests, setMyGuarantorRequests] = useState<ClientGuarantorRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractType, setContractType] = useState<ContractType>("guarantor");
  const [contractUrl, setContractUrl] = useState<string>("");
  const [guarantorRelationshipId, setGuarantorRelationshipId] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  // Проверяем, что пользователь не механик
  if (user?.role === UserRole.MECHANIC) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700 mb-2">
            Доступ запрещен
          </h1>
          <p className="text-gray-500">
            Функция "Гарант" недоступна для механиков
          </p>
        </div>
      </div>
    );
  }

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Загружаем входящие заявки
      const incomingResponse = await guarantorApi.getIncomingRequests();
      if (incomingResponse.data) {
        setIncomingRequests(incomingResponse.data);
      }

      // Загружаем моих гарантов
      const guarantorsResponse = await guarantorApi.getMyGuarantors();
      if (guarantorsResponse.data) {
        setMyGuarantors(guarantorsResponse.data);
      }

      // Загружаем моих клиентов
      const clientsResponse = await guarantorApi.getMyClients();
      if (clientsResponse.data) {
        setMyClients(clientsResponse.data);
      }

      // Загружаем мои заявки на гарантов
      const requestsResponse = await guarantorApi.getMyGuarantorRequests();
      if (requestsResponse.data) {
        setMyGuarantorRequests(requestsResponse.data.items);
      }
    } catch (error: any) {
      console.error("Error loading guarantor data:", error);
      setError(error?.response?.data?.detail || "Ошибка загрузки данных. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      setError(null);
      const response = await guarantorApi.acceptGuarantorRequest(requestId);
      if (response.data) {
        // Обновляем список входящих заявок
        await loadData();
        // Загружаем договор гаранта
        const contractResponse = await guarantorApi.getGuarantorContract();
        if (contractResponse.data) {
          setContractUrl(contractResponse.data.file_url);
          setContractType("guarantor");
          setGuarantorRelationshipId(response.data.guarantor_relationship_id);
          setShowContractModal(true);
        }
      }
    } catch (error: any) {
      console.error("Error accepting request:", error);
      setError(error?.response?.data?.detail || "Ошибка при принятии заявки. Попробуйте позже.");
    }
  };

  const handleRejectRequest = async (requestId: number, reason?: string) => {
    try {
      setError(null);
      const response = await guarantorApi.rejectGuarantorRequest(requestId, reason);
      if (response.data) {
        // Обновляем список входящих заявок
        await loadData();
      }
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      setError(error?.response?.data?.detail || "Ошибка при отклонении заявки. Попробуйте позже.");
    }
  };

  const handleAddGuarantor = async (guarantorInfo: { full_name: string; phone_number: string; reason?: string }) => {
    const response = await guarantorApi.inviteGuarantor({
      guarantor_info: guarantorInfo,
      reason: guarantorInfo.reason,
    });
    if (response.data) {
      // Обновляем список моих гарантов
      await loadData();
    }
    return response;
  };

  const handleSignContract = async (contractType: ContractType) => {
    try {
      const response = await guarantorApi.signContract(contractType, guarantorRelationshipId);
      if (response.data) {
        // Обновляем данные
        await loadData();
        setShowContractModal(false);
      }
    } catch (error) {
      console.error("Error signing contract:", error);
    }
  };

  const handleViewContract = async (contractType: ContractType, relationshipId: number) => {
    try {
      let response;
      if (contractType === "guarantor") {
        response = await guarantorApi.getGuarantorContract();
      } else {
        response = await guarantorApi.getSubleaseContract();
      }
      
      if (response.data) {
        setContractUrl(response.data.file_url);
        setContractType(contractType);
        setGuarantorRelationshipId(relationshipId);
        setShowContractModal(true);
      }
    } catch (error) {
      console.error("Error loading contract:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-lg flex-shrink-0">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              
              <h1 className="text-xl font-semibold text-[#191919]">Гарант</h1>
            </div>
            <button
              onClick={() => setShowHelpModal(true)}
              className="w-10 h-10 rounded-full bg-[#191919] flex items-center justify-center text-white hover:bg-[#333333] transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <HiQuestionMarkCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0">
        <GuarantorTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <HiX className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-red-800 font-medium">Ошибка</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab Content with Scroll */}
      <div 
        className="flex-1 px-2 py-4"
        style={{
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-y",
          overscrollBehaviorY: "auto",
        }}
      >
        {activeTab === "incoming" ? (
          <IncomingRequestsTab
            requests={incomingRequests}
            clients={myClients}
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onViewContract={handleViewContract}
          />
        ) : (
          <MyGuarantorsTab
            guarantors={myGuarantors}
            requests={myGuarantorRequests}
            onAddGuarantor={handleAddGuarantor}
            onViewContract={handleViewContract}
          />
        )}
      </div>

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Contract Modal */}
      <ContractModal
        isOpen={showContractModal}
        onClose={() => setShowContractModal(false)}
        contractType={contractType}
        contractUrl={contractUrl}
        onSign={handleSignContract}
      />
    </div>
  );
};
