"use client";
import { RoadIcon, UserIcon } from "@/shared/icons";
import { UserRole } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { Button } from "@/shared/ui";
import FooterHaveCar from "./FooterHaveCar";

const FooterBtns = () => {
  const { user } = useUserStore();

  if (!user) return null;

  if (user.current_rental != null && user.current_rental) {
    return <FooterHaveCar user={user} />;
  }

  const getFooterBtns = () => {
    if (
      user.role === UserRole.USER ||
      user.role === UserRole.PENDING ||
      user.role === UserRole.FIRST
    ) {
      return (
        <div className="flex flex-col gap-2">
          <Button className="flex items-center gap-2 justify-center border-[#E8E8E8] text-[#191919] font-medium text-[16px]">
            <UserIcon />
            <span> Часто используемые</span>
          </Button>
          <Button className="flex items-center gap-2 justify-center border-[#E8E8E8] text-[#191919] font-medium text-[16px]">
            <RoadIcon />
            <span> Свободно</span>
          </Button>
        </div>
      );
    }
  };

  return (
    <footer className="absolute bottom-4 left-4 right-4">
      {getFooterBtns()}
    </footer>
  );
};

export default FooterBtns;
