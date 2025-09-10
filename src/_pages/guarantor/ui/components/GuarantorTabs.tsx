import React from "react";

interface GuarantorTabsProps {
  activeTab: "incoming" | "my_guarantors";
  onTabChange: (tab: "incoming" | "my_guarantors") => void;
}

export const GuarantorTabs: React.FC<GuarantorTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="bg-white border-b border-[#E5E5E5]">
      <div className="flex">
        <button
          onClick={() => onTabChange("incoming")}
          className={`flex-1 px-6 py-5 text-center font-semibold text-lg transition-all duration-300 relative ${
            activeTab === "incoming"
              ? "text-[#967642] border-b-2 border-[#967642]"
              : "text-[#666666] hover:text-[#2D2D2D]"
          }`}
        >
          Я Гарант
        </button>
        <button
          onClick={() => onTabChange("my_guarantors")}
          className={`flex-1 px-6 py-5 text-center font-semibold text-lg transition-all duration-300 relative ${
            activeTab === "my_guarantors"
              ? "text-[#967642] border-b-2 border-[#967642]"
              : "text-[#666666] hover:text-[#2D2D2D]"
          }`}
        >
          Мои Гаранты
        </button>
      </div>
    </div>
  );
};
