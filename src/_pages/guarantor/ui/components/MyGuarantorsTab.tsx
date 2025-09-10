import React, { useState } from "react";
import { SimpleGuarantor } from "@/shared/models/types/guarantor";
import { ContractType, GuarantorFormData } from "@/shared/models/types/guarantor-page";
import { HiUserPlus, HiUsers, HiDocumentText, HiPlus } from "react-icons/hi2";
import { HiX } from "react-icons/hi";

interface MyGuarantorsTabProps {
  guarantors: SimpleGuarantor[];
  onAddGuarantor: (guarantorInfo: GuarantorFormData) => void;
  onViewContract: (contractType: ContractType) => void;
}

export const MyGuarantorsTab: React.FC<MyGuarantorsTabProps> = ({
  guarantors,
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

  return (
    <div className="space-y-6">
      {/* Кнопка добавления */}
      <div >
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full px-6 py-3 bg-[#967642] text-white font-semibold rounded-xl hover:bg-[#B8860B] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <HiPlus className="w-5 h-5" />
          Добавить
        </button>
      </div>

      {/* Список гарантов */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#967642] flex items-center justify-center">
            <HiUsers className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-base font-semibold text-[#2D2D2D]">
            Мои гаранты
          </h2>
        </div>
        {guarantors.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
              <HiUsers className="w-10 h-10 text-[#967642]" />
            </div>
            <p className="text-[#666666] text-base font-medium">У вас нет гарантов</p>
            <p className="text-[#999999] text-sm mt-1">
              Нажмите "Добавить" чтобы пригласить гаранта
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {guarantors.map((guarantor) => (
              <div
                key={guarantor.id}
                className="bg-white rounded-2xl border border-[#E5E5E5] p-4 shadow-sm hover:shadow-md transition-all duration-300 w-full"
              >
                <div className="flex items-start justify-between w-full">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#967642] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">
                        {guarantor.name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#2D2D2D] text-lg truncate">
                        {guarantor.name || "Не указано"}
                      </h3>
                      <p className="text-sm text-[#666666] truncate">
                        {guarantor.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 w-full">
                  
                  <div className="flex flex-col space-y-2 flex-shrink-0 w-full ">
                  <p className="text-xs text-[#999999] justify-center items-center ">
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
                    {guarantor.contract_signed && (
                      <button
                        onClick={() => onViewContract("guarantor")}
                        className="px-3 py-2 bg-[#967642] text-white text-xs font-semibold rounded-lg hover:bg-[#B8860B] transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                      >
                        Подписать договор
                      </button>
                    )}
                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно добавления гаранта */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#967642] flex items-center justify-center">
                  <HiUserPlus className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#2D2D2D]">
                  Добавить гаранта
                </h3>
              </div>
              <button
                onClick={handleCloseModal}
                disabled={loading || success}
                className={`text-[#999999] hover:text-[#666666] transition-colors duration-200 ${
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
                <label className="block text-sm font-medium text-[#666666] mb-3">
                  ФИО гаранта *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#967642]/20 focus:border-[#967642] transition-all duration-300"
                  placeholder="Введите ФИО гаранта"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-3">
                  Номер телефона *
                </label>
                <input
                  type="tel"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange("phone_number", e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#967642]/20 focus:border-[#967642] transition-all duration-300"
                  placeholder="Введите номер телефона"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#666666] mb-3">
                  Причина (необязательно)
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E5E5] rounded-xl focus:ring-2 focus:ring-[#967642]/20 focus:border-[#967642] transition-all duration-300 resize-none"
                  rows={3}
                  placeholder="Укажите причину приглашения гаранта..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={loading || success}
                  className={`flex-1 px-4 py-3 border border-[#E5E5E5] text-[#666666] rounded-xl hover:bg-[#F8F8F8] transition-all duration-300 font-medium ${
                    loading || success ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className={`flex-1 px-4 py-3 bg-[#967642] text-white rounded-xl hover:bg-[#B8860B] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl ${
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
