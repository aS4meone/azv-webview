import React, { useState } from "react";
import { SimpleGuarantor, ClientGuarantorRequestItem, GuarantorRequestStatus } from "@/shared/models/types/guarantor";
import { ContractType, GuarantorFormData } from "@/shared/models/types/guarantor-page";
import { HiUserPlus, HiUsers, HiDocumentText, HiPlus, HiClock, HiCheckCircle, HiXCircle, HiExclamationTriangle } from "react-icons/hi2";
import { HiX } from "react-icons/hi";

interface MyGuarantorsTabProps {
  guarantors: SimpleGuarantor[];
  requests: ClientGuarantorRequestItem[];
  onAddGuarantor: (guarantorInfo: GuarantorFormData) => void;
  onViewContract: (contractType: ContractType, relationshipId: number) => void;
}

export const MyGuarantorsTab: React.FC<MyGuarantorsTabProps> = ({
  guarantors,
  requests,
  onAddGuarantor,
  onViewContract,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<GuarantorFormData>({
    full_name: "",
    phone_number: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await onAddGuarantor(formData);
      setSuccess(true);
      setFormData({ full_name: "", phone_number: "", reason: "" });
      
      // Закрываем модальное окно через 2 секунды после успешной отправки
      setTimeout(() => {
        setShowAddModal(false);
        setSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error("Error adding guarantor:", error);
      setError(error?.response?.data?.detail || "Ошибка при добавлении гаранта. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof GuarantorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCloseModal = () => {
    if (!loading && !success) {
      setShowAddModal(false);
      setError(null);
      setSuccess(false);
      setFormData({ full_name: "", phone_number: "", reason: "" });
    }
  };

  const getStatusInfo = (status: GuarantorRequestStatus) => {
    switch (status) {
      case GuarantorRequestStatus.PENDING:
        return {
          text: "Ожидание",
          color: "text-amber-600",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
          icon: HiClock
        };
      case GuarantorRequestStatus.ACCEPTED:
        return {
          text: "Принято",
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          icon: HiCheckCircle
        };
      case GuarantorRequestStatus.REJECTED:
        return {
          text: "Отклонено",
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          icon: HiXCircle
        };
      case GuarantorRequestStatus.EXPIRED:
        return {
          text: "Истекло",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          icon: HiExclamationTriangle
        };
      default:
        return {
          text: "Неизвестно",
          color: "text-gray-600",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          icon: HiExclamationTriangle
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Кнопка добавления */}
      <div >
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full px-6 py-3 bg-[#191919] text-white font-semibold rounded-xl hover:bg-[#333333] transition-all duration-300  flex items-center justify-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Добавить
        </button>
      </div>

      {/* Заявки в ожидании */}
      {requests.filter(req => req.status === GuarantorRequestStatus.PENDING).length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
              <HiClock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-[#191919]">
              В ожидании
              <span className="ml-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                {requests.filter(req => req.status === GuarantorRequestStatus.PENDING).length}
              </span>
            </h2>
          </div>
          <div className="space-y-4">
            {requests
              .filter(req => req.status === GuarantorRequestStatus.PENDING)
              .map((request) => {
                const statusInfo = getStatusInfo(request.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div
                    key={request.id}
                    className="bg-[#F8F8F8] rounded-2xl p-4 w-full"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {request.guarantor_name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#191919] text-lg truncate">
                            {request.guarantor_name || "Не указано"}
                          </h3>
                          <p className="text-sm text-[#191919] truncate">
                            {request.guarantor_phone}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 w-full">
                      <div className="flex flex-col space-y-2 flex-shrink-0 w-full">
                        <p className="text-xs text-[#191919] justify-center items-center">
                          Отправлено: {new Date(request.created_at).toLocaleDateString("ru-RU")}
                        </p>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        {request.reason && (
                          <p className="text-xs text-[#191919] bg-gray-100 rounded-lg p-2">
                            <strong>Причина:</strong> {request.reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Принятые заявки (Мои гаранты) */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
            <HiCheckCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-semibold text-[#191919]">
            Принятые заявки
            {guarantors.length > 0 && (
              <span className="ml-2 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                {guarantors.length}
              </span>
            )}
          </h2>
        </div>
        {guarantors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <HiCheckCircle className="w-10 h-10 text-[#191919]" />
            </div>
            <p className="text-[#191919] text-base font-medium">Нет принятых заявок</p>
            <p className="text-[#191919] text-sm mt-1">
              Здесь будут отображаться заявки, которые приняли ваши гаранты
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {guarantors.map((guarantor) => (
              <div
                key={guarantor.id}
                className="bg-[#F8F8F8] rounded-2xl p-4 w-full"
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {guarantor.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#191919] text-lg truncate">
                        {guarantor.name || "Не указано"}
                      </h3>
                      <p className="text-sm text-[#191919] truncate">
                        {guarantor.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 w-full">
                  
                  <div className="flex flex-col space-y-2 flex-shrink-0 w-full ">
                  <p className="text-xs text-[#191919] justify-center items-center ">
                      Добавлен: {new Date(guarantor.created_at).toLocaleDateString("ru-RU")}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded-full justify-center items-center font-medium flex items-center gap-1 whitespace-nowrap ${
                        guarantor.contract_signed
                          ? "bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20"
                          : "bg-[#FF9800]/10 text-[#FF9800] border border-[#FF9800]/20"
                      }`}
                    >
                      <HiDocumentText className="w-3 h-3" />
                      {guarantor.contract_signed ? "Договор подписан" : "Договор не подписан"}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full justify-center items-center font-medium flex items-center gap-1 whitespace-nowrap ${
                        guarantor.sublease_contract_signed
                          ? "bg-[#2E7D32]/10 text-[#2E7D32] border border-[#2E7D32]/20"
                          : "bg-[#FF9800]/10 text-[#FF9800] border border-[#FF9800]/20"
                      }`}
                    >
                      <HiDocumentText className="w-3 h-3" />
                      {guarantor.sublease_contract_signed ? "Субаренда подписана" : "Субаренда не подписана"}
                    </span>
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Отклоненные заявки */}
      {requests.filter(req => req.status === GuarantorRequestStatus.REJECTED).length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
              <HiXCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-[#191919]">
              Отклоненные
              <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
                {requests.filter(req => req.status === GuarantorRequestStatus.REJECTED).length}
              </span>
            </h2>
          </div>
          <div className="space-y-4">
            {requests
              .filter(req => req.status === GuarantorRequestStatus.REJECTED)
              .map((request) => {
                const statusInfo = getStatusInfo(request.status);
                const StatusIcon = statusInfo.icon;
                return (
                  <div
                    key={request.id}
                    className="bg-[#F8F8F8] rounded-2xl p-4 w-full"
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#191919] flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {request.guarantor_name?.charAt(0) || "?"}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#191919] text-lg truncate">
                            {request.guarantor_name || "Не указано"}
                          </h3>
                          <p className="text-sm text-[#191919] truncate">
                            {request.guarantor_phone}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 w-full">
                      <div className="flex flex-col space-y-2 flex-shrink-0 w-full">
                        <p className="text-xs text-[#191919] justify-center items-center">
                          Отклонено: {request.responded_at ? new Date(request.responded_at).toLocaleDateString("ru-RU") : "Не указано"}
                        </p>
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}>
                          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                          <span className={`text-sm font-medium ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>
                        {request.reason && (
                          <p className="text-xs text-[#191919] bg-gray-100 rounded-lg p-2">
                            <strong>Причина:</strong> {request.reason}
                          </p>
                        )}
                        {request.admin_notes && (
                          <p className="text-xs text-[#191919] bg-red-50 rounded-lg p-2">
                            <strong>Причина отклонения:</strong> {request.admin_notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Модальное окно добавления гаранта */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#191919] flex items-center justify-center">
                  <HiUserPlus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-[#191919]">
                  Добавить гаранта
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={loading || success}
                className={`text-[#191919] hover:text-[#191919] transition-colors duration-200 ${
                  loading || success ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>

            {/* Сообщение об успехе */}
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">Успешно!</p>
                    <p className="text-green-600 text-sm">Гарант успешно добавлен</p>
                  </div>
                </div>
              </div>
            )}

            {/* Сообщение об ошибке */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                    <HiX className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-red-800 font-medium">Ошибка</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#191919] mb-2">
                  ФИО гаранта *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919] transition-all duration-300"
                  placeholder="Введите ФИО гаранта"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#191919] mb-2">
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919] transition-all duration-300"
                  placeholder="Введите номер телефона"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#191919] mb-2">
                  Причина (необязательно)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#191919]/20 focus:border-[#191919] transition-all duration-300 resize-none"
                  rows={3}
                  placeholder="Укажите причину приглашения гаранта..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading || success}
                  className={`flex-1 px-4 py-3 border border-[#E5E5E5] text-[#191919] rounded-xl hover:bg-[#F8F8F8] transition-all duration-300 font-medium ${
                    loading || success ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`flex-1 px-4 py-3 bg-[#191919] text-white rounded-xl hover:bg-[#333333] transition-all duration-300 font-semibold  ${
                    loading || success ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      Отправка...
                    </div>
                  ) : success ? (
                    <div className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Успешно!
                    </div>
                  ) : (
                    "Пригласить"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
