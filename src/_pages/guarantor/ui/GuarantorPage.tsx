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
import { useTranslations } from "next-intl";

export const GuarantorPage: React.FC = () => {
  const { user } = useUserStore();
  const t = useTranslations();
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
  
  // Состояние для предзагрузки договоров
  const [preloadedContracts, setPreloadedContracts] = useState<{
    guarantor?: string;
    sublease?: string;
  }>({});
  const [isPreloadingContracts, setIsPreloadingContracts] = useState(false);

  // Проверяем, что пользователь не механик
  if (user?.role === UserRole.MECHANIC) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-700 mb-2">
            {t("guarantor.accessDenied")}
          </h1>
          <p className="text-gray-500">
            {t("guarantor.mechanicNotAllowed")}
          </p>
        </div>
      </div>
    );
  }

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    loadData();
  }, []);

  // Функция для предзагрузки договоров
  const preloadContracts = async () => {
    if (isPreloadingContracts) return;
    
    setIsPreloadingContracts(true);
    try {
      console.log("🔄 Начинаем предзагрузку договоров...");
      
      // Предзагружаем оба договора параллельно
      const [guarantorResponse, subleaseResponse] = await Promise.allSettled([
        guarantorApi.getGuarantorContract(),
        guarantorApi.getSubleaseContract()
      ]);

      const newPreloadedContracts: { guarantor?: string; sublease?: string } = {};

      if (guarantorResponse.status === 'fulfilled' && guarantorResponse.value.data) {
        newPreloadedContracts.guarantor = guarantorResponse.value.data.file_url;
        console.log("✅ Договор гаранта предзагружен");
      }

      if (subleaseResponse.status === 'fulfilled' && subleaseResponse.value.data) {
        newPreloadedContracts.sublease = subleaseResponse.value.data.file_url;
        console.log("✅ Договор субаренды предзагружен");
      }

      setPreloadedContracts(newPreloadedContracts);
      console.log("🎉 Предзагрузка договоров завершена:", newPreloadedContracts);
      
    } catch (error) {
      console.error("❌ Ошибка при предзагрузке договоров:", error);
    } finally {
      setIsPreloadingContracts(false);
    }
  };

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
      setError(error?.response?.data?.detail || t("guarantor.loadingError"));
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
        
        // Запускаем предзагрузку договоров
        await preloadContracts();
        
        // Используем предзагруженный договор или загружаем заново
        const contractUrl = preloadedContracts.guarantor;
        if (contractUrl) {
          setContractUrl(contractUrl);
          setContractType("guarantor");
          setGuarantorRelationshipId(response.data.guarantor_relationship_id);
          setShowContractModal(true);
        } else {
          // Fallback: загружаем договор гаранта напрямую
          const contractResponse = await guarantorApi.getGuarantorContract();
          if (contractResponse.data) {
            setContractUrl(contractResponse.data.file_url);
            setContractType("guarantor");
            setGuarantorRelationshipId(response.data.guarantor_relationship_id);
            setShowContractModal(true);
          }
        }
      }
    } catch (error: any) {
      console.error("Error accepting request:", error);
      setError(error?.response?.data?.detail || t("guarantor.acceptError"));
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
      setError(error?.response?.data?.detail || t("guarantor.rejectError"));
    }
  };

  const handleAddGuarantor = async (guarantorInfo: { phone_number: string; reason?: string }): Promise<{ statusCode: number; data: any; error: string | null }> => {
    // Логируем данные перед отправкой в API
    console.log("🚀 Вызываем guarantorApi.inviteGuarantor с данными:", {
      guarantor_info: guarantorInfo,
      reason: guarantorInfo.reason,
      full_api_payload: {
        guarantor_info: guarantorInfo,
        reason: guarantorInfo.reason,
      }
    });
    
    const response = await guarantorApi.inviteGuarantor({
      guarantor_info: guarantorInfo,
      reason: guarantorInfo.reason,
    });
    
    // Логируем ответ от API
    console.log("📥 Ответ от guarantorApi.inviteGuarantor:", {
      statusCode: response.statusCode,
      data: response.data,
      error: response.error
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
        
        // Если подписан договор гаранта, автоматически открываем договор субаренды
        if (contractType === "guarantor") {
          console.log("✅ Договор гаранта подписан, открываем договор субаренды...");
          
          // Используем предзагруженный договор субаренды
          const subleaseUrl = preloadedContracts.sublease;
          if (subleaseUrl) {
            setContractUrl(subleaseUrl);
            setContractType("sublease");
            setGuarantorRelationshipId(guarantorRelationshipId);
            console.log("📄 Открываем предзагруженный договор субаренды");
          } else {
            // Fallback: загружаем договор субаренды напрямую
            const subleaseResponse = await guarantorApi.getSubleaseContract();
            if (subleaseResponse.data) {
              setContractUrl(subleaseResponse.data.file_url);
              setContractType("sublease");
              setGuarantorRelationshipId(guarantorRelationshipId);
              console.log("📄 Открываем договор субаренды");
            } else {
              console.error("❌ Ошибка получения договора субаренды:", subleaseResponse.error);
              setShowContractModal(false);
            }
          }
        } else {
          // Если подписан договор субаренды, закрываем модальное окно
          setShowContractModal(false);
        }
      }
    } catch (error) {
      console.error("Error signing contract:", error);
    }
  };

  const handleViewContract = async (contractType: ContractType, relationshipId: number) => {
    try {
      // Запускаем предзагрузку если еще не загружены договоры
      if (Object.keys(preloadedContracts).length === 0) {
        await preloadContracts();
      }
      
      // Используем предзагруженный договор
      const contractUrl = contractType === "guarantor" 
        ? preloadedContracts.guarantor 
        : preloadedContracts.sublease;
        
      if (contractUrl) {
        setContractUrl(contractUrl);
        setContractType(contractType);
        setGuarantorRelationshipId(relationshipId);
        setShowContractModal(true);
        console.log(`📄 Открываем предзагруженный договор: ${contractType}`);
      } else {
        // Fallback: загружаем договор напрямую
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
          <p className="text-gray-500">{t("guarantor.loading")}</p>
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
              
              <h1 className="text-xl font-semibold text-[#191919]">{t("main.drawer.menu.guarantor")}</h1>
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
              <p className="text-red-800 font-medium">{t("error")}</p>
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
        isPreloading={isPreloadingContracts}
      />
    </div>
  );
};
