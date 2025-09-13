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
    <div className="bg-white p-2 ">
      <div className="flex bg-[#F4F4F4] rounded-full gap-2 p-1 mb-6">
        <button
          onClick={() => onTabChange("incoming")}
          className={`flex-1 py-3 px-6 rounded-full text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-20 ${
            activeTab === "incoming"
              ? "bg-[#191919] text-white transform scale-[0.98]"
              : "bg-transparent text-[#191919] hover:bg-gray-200"
          }`}
        >
          Я Гарант
        </button>
        <button
          onClick={() => onTabChange("my_guarantors")}
          className={`flex-1 py-3 px-6 rounded-full text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-20 ${
            activeTab === "my_guarantors"
              ? "bg-[#191919] text-white transform scale-[0.98]"
              : "bg-transparent text-[#191919] hover:bg-gray-200"
          }`}
        >
          Мои Гаранты
        </button>
      </div>
    </div>
  );
};
