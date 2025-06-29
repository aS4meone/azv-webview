"use client";
import { ArrowLeftIcon, LogoutIcon, MenuIcon } from "@/shared/icons";
import { Button } from "@/shared/ui/button";
import React, { useState } from "react";
import { cn } from "@/shared/utils/cn";
import { ROUTES } from "@/shared/constants/routes";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/shared/stores/userStore";
import { clearTokens } from "@/shared/utils/tokenStorage";
import { callFlutterLogout } from "@/shared/utils/flutterLogout";
import { useRouter } from "next/navigation";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { TripsAndFinesPage } from "@/_pages/trips";
import { WalletPage } from "@/_pages/wallet";
import { SupportPage } from "@/_pages/support";
import { TermsPage } from "@/_pages/terms";
import { ProfilePage } from "@/_pages/profile";
import { UserRole } from "@/shared/models/types/user";

type ComponentKeys = "trips" | "wallet" | "support" | "terms" | "profile";

const Drawer = () => {
  const { user } = useUserStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activePush, setActivePush] = useState<ComponentKeys | null>(null);
  const t = useTranslations();

  const components = {
    trips: <TripsAndFinesPage />,
    wallet: <WalletPage />,
    support: <SupportPage />,
    terms: <TermsPage />,
    profile: <ProfilePage />,
  };

  const router = useRouter();
  const items = [
    {
      translationKey: "main.drawer.menu.tripsAndPayments",
      key: "trips" as ComponentKeys,
    },

    {
      translationKey: "main.drawer.menu.wallet",
      key: "wallet" as ComponentKeys,
    },

    {
      translationKey: "main.drawer.menu.support",
      key: "support" as ComponentKeys,
    },
    {
      translationKey: "main.drawer.menu.termsAndPolicy",
      key: "terms" as ComponentKeys,
    },
    {
      translationKey: "main.drawer.menu.settings",
      key: "profile" as ComponentKeys,
    },
  ];

  const itemsToShow =
    user?.role !== UserRole.MECHANIC
      ? [
          {
            translationKey: "main.drawer.menu.tripsAndPayments",
            key: "trips" as ComponentKeys,
          },

          {
            translationKey: "main.drawer.menu.support",
            key: "support" as ComponentKeys,
          },
          {
            translationKey: "main.drawer.menu.termsAndPolicy",
            key: "terms" as ComponentKeys,
          },
        ]
      : [
          {
            translationKey: "main.drawer.menu.tripsAndPayments",
            key: "trips" as ComponentKeys,
          },
          {
            translationKey: "main.drawer.menu.wallet",
            key: "wallet" as ComponentKeys,
          },
          {
            translationKey: "main.drawer.menu.support",
            key: "support" as ComponentKeys,
          },
          {
            translationKey: "main.drawer.menu.termsAndPolicy",
            key: "terms" as ComponentKeys,
          },
        ];

  const handleItemClick = (key: ComponentKeys) => {
    if (components?.[key]) {
      setActivePush(key);
    }
  };

  return (
    <>
      <Button
        variant="icon"
        className="absolute top-10 left-4 h-14 w-14 rounded-full bg-white shadow-lg hover:bg-gray-50 z-10"
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

      <div
        className={cn(
          "fixed flex flex-col justify-between pb-10 top-0 left-0 h-full w-80 bg-[#191919] transform transition-transform duration-300 ease-in-out z-20",
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
          <button
            onClick={() => handleItemClick("profile")}
            className="flex items-center justify-between p-8"
          >
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {t("main.drawer.menu.profile")}
                </h2>
              </div>
            </div>
            <div className="text-white hover:bg-gray-800">
              <ArrowLeftIcon className="rotate-180" color="white" />
            </div>
          </button>

          <div className="flex flex-col">
            <nav className="py-6 space-y-1">
              {itemsToShow.map((item) => (
                <button
                  key={item.translationKey}
                  className="flex items-center space-x-3 w-full text-left py-4 px-8 text-white active:bg-gray-800 transition-colors"
                  onClick={() => handleItemClick(item.key)}
                >
                  {t(item.translationKey)}
                </button>
              ))}
            </nav>
          </div>
        </div>
        <button
          className="flex items-center space-x-3 w-full text-left py-3 px-8 rounded-lg transition-colors"
          onClick={async (e) => {
            e.preventDefault();

            try {
              await callFlutterLogout();
              console.log("FCM token cleared successfully");
            } catch (error) {
              console.error("Error clearing FCM token:", error);
            }

            clearTokens();
            router.push(ROUTES.ONBOARDING);
          }}
        >
          <LogoutIcon />
          <span className="text-white">{t("main.drawer.logout")}</span>
        </button>
      </div>

      {items.map((item) => (
        <CustomPushScreen
          key={item.key}
          direction="right"
          isOpen={activePush === item.key}
          onClose={() => setActivePush(null)}
        >
          {components?.[item.key]}
        </CustomPushScreen>
      ))}
    </>
  );
};

export default Drawer;
