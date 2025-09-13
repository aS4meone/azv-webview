import React from "react";
import { HiX, HiQuestionMarkCircle } from "react-icons/hi";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <CustomPushScreen 
      isOpen={isOpen} 
      onClose={onClose}
      direction="right"
      withHeader={false}
      fullScreen={true}
    >
      <div className="relative w-full h-screen flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 mt-[48px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#191919] flex items-center justify-center">
              <HiQuestionMarkCircle className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-[#191919]">
              Что такое Гарант?
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#999999] hover:text-[#191919] transition-colors duration-200"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div 
          className="flex-1 overflow-y-auto px-4 py-6"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-y",
            overscrollBehaviorY: "auto",
          }}
        >
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-[#191919] mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#191919]"></div>
                Определение
              </h4>
              <p className="text-sm text-[#191919] leading-relaxed">
                Гарант — лицо, которое в случае ДТП несёт материальную ответственность.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#191919] mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#191919]"></div>
                Как это работает?
              </h4>
              <ul className="text-sm text-[#191919] space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-[#191919] mt-1">•</span>
                  <span>Гарант берет на себя материальную ответственность за ваши действия</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#191919] mt-1">•</span>
                  <span>В случае ДТП или других обязательств гарант несет финансовую ответственность</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#191919] mt-1">•</span>
                  <span>Гарант должен подписать соответствующие договоры</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#191919] mt-1">•</span>
                  <span>Связь между вами и гарантом должна быть подтверждена обеими сторонами</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#191919] mb-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#191919]"></div>
                Вкладки
              </h4>
              <div className="text-sm text-[#191919] space-y-3">
                <div className="bg-[#F8F8F8] rounded-lg p-3">
                  <strong className="text-[#191919]">Я Гарант:</strong> Здесь отображаются заявки от людей, которые просят вас стать их гарантом, а также список людей, за которых вы уже несете ответственность.
                </div>
                <div className="bg-[#F8F8F8] rounded-lg p-3">
                  <strong className="text-[#191919]">Мои Гаранты:</strong> Здесь вы можете добавить своих гарантов и просматривать их статус.
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Fixed Footer */}
        <div className="flex-shrink-0 p-4 bg-white border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-[#191919] text-white rounded-xl hover:bg-[#333333] transition-all duration-300 font-semibold"
          >
            Понятно
          </button>
        </div>
      </div>
    </CustomPushScreen>
  );
};
