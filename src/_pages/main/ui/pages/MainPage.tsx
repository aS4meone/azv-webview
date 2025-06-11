"use client";
import { Button } from "@/shared/ui";
import { ChatIcon } from "@/shared/icons";
import { Drawer } from "../widgets/drawer";
import { ROUTES } from "@/shared/constants/routes";
import { MapComponent } from "../widgets/map/Map";
import { FooterBtns } from "../widgets/footer-btns";
import SearchIcon from "@/shared/icons/ui/SearchIcon";
import { useUserStore } from "@/shared/stores/userStore";
import { useEffect } from "react";

export default function GoogleMapsPage() {
  const { fetchUser } = useUserStore();

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <MapComponent />

      <Drawer />
      <Button
        variant="icon"
        className="absolute top-10 right-20 h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50 z-10"
        link={ROUTES.SEARCH}
      >
        <SearchIcon />
      </Button>
      <Button
        variant="icon"
        className="absolute top-10 right-4 h-12 w-12 rounded-full bg-white shadow-lg hover:bg-gray-50 z-10"
        link={ROUTES.SUPPORT}
      >
        <ChatIcon />
      </Button>
      <FooterBtns />
    </div>
  );
}
