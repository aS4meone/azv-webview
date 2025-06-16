"use client";
import { ArrowLeftIcon, LogoutIcon, MenuIcon } from "@/shared/icons";
import { Button } from "@/shared/ui/button";
import React, { useState } from "react";
import { DrawerMenuItem } from "./DrawerMenuItem";
import { cn } from "@/shared/utils/cn";
import Link from "next/link";
import { ROUTES } from "@/shared/constants/routes";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/shared/stores/userStore";
import { clearTokens } from "@/shared/utils/tokenStorage";
import { useRouter } from "next/navigation";

const Drawer = () => {
  const { user } = useUserStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const t = useTranslations();

  const router = useRouter();
  const items = [
    {
      translationKey: "main.drawer.menu.tripsAndPayments",
      href: ROUTES.TRIPS,
    },
    {
      translationKey: "main.drawer.menu.wallet",
      href: ROUTES.WALLET,
    },
    {
      translationKey: "main.drawer.menu.support",
      href: ROUTES.SUPPORT,
    },
    {
      translationKey: "main.drawer.menu.termsAndPolicy",
      href: ROUTES.TERMS,
    },
  ];

  return (
    <>
      <Button
        variant="icon"
        className=" absolute top-10 left-4 h-14 w-14 rounded-full bg-white shadow-lg hover:bg-gray-50 z-10"
        onClick={() => setIsDrawerOpen(true)}
      >
        <MenuIcon />
      </Button>

      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          "fixed flex flex-col justify-between pb-10 top-0 left-0 h-full w-80 bg-[#191919] transform transition-transform duration-300 ease-in-out z-30",
          isDrawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="mt-16">
          <button
            onClick={() => setIsDrawerOpen(false)}
            className="flex justify-between w-full px-8 mb-10"
          >
            <div></div> <MenuIcon color="white" />
          </button>
          <Link
            href={ROUTES.PROFILE}
            className="flex items-center justify-between p-8"
          >
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-lg font-semibold">
                  {user?.full_name || "Пользователь"}
                </h2>
              </div>
            </div>
            <button
              className="text-white hover:bg-gray-800"
              onClick={() => setIsDrawerOpen(false)}
            >
              <ArrowLeftIcon className="rotate-180" color="white" />
            </button>
          </Link>

          <div className="flex flex-col ">
            <nav className=" py-6 space-y-1">
              {items.map((item) => (
                <DrawerMenuItem
                  key={item.translationKey}
                  translationKey={item.translationKey}
                  href={item.href}
                />
              ))}
            </nav>
          </div>
        </div>
        <button
          className="flex items-center space-x-3 w-full text-left py-3 px-8 rounded-lg transition-colors"
          onClick={(e) => {
            e.preventDefault();
            clearTokens();
            router.push(ROUTES.ROOT);
          }}
        >
          <LogoutIcon />
          <span className="text-white">{t("main.drawer.logout")}</span>
        </button>
      </div>
    </>
  );
};

export default Drawer;
