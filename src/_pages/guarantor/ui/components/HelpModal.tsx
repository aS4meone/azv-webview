import React from "react";
import { HiX, HiQuestionMarkCircle } from "react-icons/hi";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#967642] flex items-center justify-center">
              <HiQuestionMarkCircle className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-[#2D2D2D]">
              Что такое Гарант?
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#666666] transition-colors duration-200"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-[#2D2D2D] mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#967642]"></div>
              Определение
            </h4>
            <p className="text-sm text-[#666666] leading-relaxed">
              Гарант — лицо, которое в случае ДТП несёт материальную ответственность.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#2D2D2D] mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#967642]"></div>
              Как это работает?
            </h4>
            <ul className="text-sm text-[#666666] space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-[#967642] mt-1">•</span>
                <span>Гарант берет на себя материальную ответственность за ваши действия</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#967642] mt-1">•</span>
                <span>В случае ДТП или других обязательств гарант несет финансовую ответственность</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#967642] mt-1">•</span>
                <span>Гарант должен подписать соответствующие договоры</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#967642] mt-1">•</span>
                <span>Связь между вами и гарантом должна быть подтверждена обеими сторонами</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-[#2D2D2D] mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#967642]"></div>
              Вкладки
            </h4>
            <div className="text-sm text-[#666666] space-y-3">
              <div className="bg-[#F8F8F8] rounded-lg p-3">
                <strong className="text-[#967642]">Я Гарант:</strong> Здесь отображаются заявки от людей, которые просят вас стать их гарантом, а также список людей, за которых вы уже несете ответственность.
              </div>
              <div className="bg-[#F8F8F8] rounded-lg p-3">
                <strong className="text-[#967642]">Мои Гаранты:</strong> Здесь вы можете добавить своих гарантов и просматривать их статус.
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-[#967642] text-white rounded-xl hover:bg-[#B8860B] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};
