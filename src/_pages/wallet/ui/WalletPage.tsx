"use client";
import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
import React, { useEffect, useState } from "react";
import { Button } from "@/shared/ui";
import { PlusIcon } from "@/shared/icons";
import { useTranslations } from "next-intl";
import { userApi } from "@/shared/api/routes/user";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";
import { useSearchParams } from "next/navigation";
import { useModal } from "@/shared/ui/modal/ModalContext";

const PromoCodeModal = ({
  onSubmit,
  isLoading,
}: {
  onSubmit: (code: string) => void;
  isLoading: boolean;
}) => {
  const [code, setCode] = useState("");
  const t = useTranslations("wallet");

  return (
    <div className="rounded-2xl rounded-b-none overflow-hidden">
      <div className="bg-white p-6 ">
        <div className="flex items-center gap-2 mb-6">
          <div className="text-2xl">🎁</div>
          <h2 className="text-xl font-bold text-gray-900">{t("promocodes")}</h2>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Введите промокод"
              className="w-full text-base bg-gray-50 text-gray-900 outline-none border-2 border-transparent
                     focus:border-gray-800 focus:bg-white placeholder:text-gray-400 p-4 rounded-2xl
                     transition-all duration-300 shadow-inner focus:shadow-lg"
              disabled={isLoading}
              autoFocus
            />
            {code && (
              <button
                onClick={() => setCode("")}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                ✕
              </button>
            )}
          </div>

          <Button
            variant="secondary"
            className={`font-semibold text-lg text-white w-full
                    ${
                      code ? "" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]`}
            onClick={() => code.trim() && onSubmit(code)}
            disabled={!code.trim() || isLoading}
          >
            <div className="flex items-center justify-center gap-2">
              {isLoading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isLoading ? "Активируем..." : t("activate")}</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

const WalletPage = () => {
  const t = useTranslations("wallet");
  const { showModal: showResponseModal } = useResponseModal();
  const { showModal } = useModal();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const searchParams = useSearchParams();
  const carId = Number(searchParams?.get("carId")) || 0;
  const lat = Number(searchParams?.get("lat")) || 0;
  const lng = Number(searchParams?.get("lng")) || 0;

  const redirectRoute =
    carId !== 0
      ? `${ROUTES.MAIN}?carId=${carId}&lat=${lat}&lng=${lng}`
      : ROUTES.MAIN;

  const handleTopUp = async () => {
    setIsTopUpLoading(true);
    try {
      const response = await userApi.addMoney(100000);
      if (response.status === 200) {
        await getBalance();
        showResponseModal({
          type: "success",
          description: `Баланс успешно пополнен на 100000 ₸`,
          buttonText: "Хорошо",
        });
      }
    } catch (error) {
      console.error("Error topping up:", error);
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const handleApplyPromoCode = async (promoCode: string) => {
    if (!promoCode.trim()) return;
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Applying promo code:", promoCode);
      showResponseModal({
        type: "success",
        description: `Промокод "${promoCode}" успешно активирован!`,
        buttonText: "Отлично",
      });
    } catch (error) {
      console.error("Error applying promo code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getBalance = async () => {
    try {
      const response = await userApi.getUser();
      setBalance(response.data.wallet_balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    getBalance();
  }, []);

  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("ru-RU").format(amount);
  };

  const openPromoCodeModal = () => {
    showModal({
      children: (
        <PromoCodeModal onSubmit={handleApplyPromoCode} isLoading={isLoading} />
      ),
    });
  };

  return (
    <article className="flex overflow-y-auto flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10">
      <CustomAppBar backHref={redirectRoute} title={t("title")} />

      {/* Balance Section */}
      <section className="px-6 mt-8">
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-[40px] p-8 text-white shadow-2xl shadow-gray-900/25">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/30 rounded-full transform -translate-x-8 translate-y-8"></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-white/60 font-medium uppercase tracking-wider">
                {t("currentBalance")}
              </p>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              {formatBalance(balance)} ₸
            </h1>
            <p className="text-xs text-white/50">Доступно для использования</p>
          </div>
        </div>
      </section>

      {/* Actions Section */}
      <section className="px-6 mt-8 space-y-4">
        <Button
          variant="secondary"
          onClick={handleTopUp}
          disabled={isTopUpLoading}
        >
          <div className="flex items-center justify-center gap-3">
            <div
              className={`transition-transform duration-300 ${
                isTopUpLoading ? "animate-spin" : "group-hover:rotate-12"
              }`}
            >
              {isTopUpLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <PlusIcon color="white" />
              )}
            </div>
            <span className="font-semibold text-lg text-white">
              {isTopUpLoading ? "Пополняем..." : t("topUp")}
            </span>
          </div>
        </Button>

        <Button
          variant="outline"
          onClick={openPromoCodeModal}
          className="w-full"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl">🎁</span>
            <span className="font-semibold">{t("promocodes")}</span>
          </div>
        </Button>
      </section>
    </article>
  );
};

export default WalletPage;
