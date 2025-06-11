"use client";
import { ROUTES } from "@/shared/constants/routes";
import { CustomAppBar } from "@/widgets/appbars";
import React, { useEffect, useState } from "react";
import { Button } from "@/shared/ui";
import { PlusIcon } from "@/shared/icons";
import { useTranslations } from "next-intl";
import { userApi } from "@/shared/api/routes/user";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";

const WalletPage = () => {
  const t = useTranslations("wallet");
  const { showModal } = useResponseModal();
  const [balance, setBalance] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [cards] = useState([{ id: 1, last4: "4242", isMain: true }]);

  const handleTopUp = async () => {
    const response = await userApi.addMoney(100000);
    if (response.status === 200) {
      getBalance();
      setPromoCode("");
      showModal({
        type: "success",
        description: `Баланс успешно пополнен на ${response.data.wallet_balance} ₸`,
        buttonText: "Хорошо",
      });
    }
  };

  const handleApplyPromoCode = () => {
    console.log("Applying promo code:", promoCode);
    setPromoCode("");
  };

  const handleAddCard = () => {
    console.log("Adding new card");
  };

  const getBalance = async () => {
    const response = await userApi.getUser();
    setBalance(response.data.wallet_balance);
  };
  useEffect(() => {
    getBalance();
  }, []);

  return (
    <article className="flex flex-col min-h-screen bg-white pt-10">
      <CustomAppBar backHref={ROUTES.MAIN} title={t("title")} />

      {/* Balance Section */}
      <section className="px-8 mt-6">
        <div className="bg-[#191919] rounded-[20px] p-6 text-white">
          <p className="text-[16px] text-white/80 mb-2">
            {t("currentBalance")}
          </p>
          <h1 className="text-[32px] font-medium">{balance} ₸</h1>
        </div>
      </section>

      {/* Cards Section */}
      <section className="px-8 mt-6">
        <h2 className="text-[20px] text-[#191919] mb-4">
          {t("paymentMethods")}
        </h2>
        {cards.map((card) => (
          <div key={card.id} className="bg-[#F8F8F8] rounded-[20px] p-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[16px] text-[#191919]">•••• {card.last4}</p>
                {card.isMain && (
                  <span className="text-[14px] text-[#6F6F6F]">
                    {t("mainCard")}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="secondary"
          className="w-full mt-2"
          onClick={handleAddCard}
        >
          {t("addCard")}
        </Button>
      </section>

      {/* Top Up Button */}
      <section className="px-8 mt-6">
        <Button
          className="flex items-center justify-center gap-2 text-[#191919]"
          onClick={handleTopUp}
        >
          <PlusIcon color="#191919" />
          <span>{t("topUp")}</span>
        </Button>
      </section>

      {/* Spacer to push promocodes to bottom */}
      <div className="flex-grow" />

      {/* Promocodes Section */}
      <section className="px-8 mb-8">
        <h2 className="text-[20px] text-[#191919] mb-4">{t("promocodes")}</h2>

        <input
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value)}
          placeholder="AZVMotors"
          className="w-full text-[16px] bg-[#F7F7F7] text-[#191919] outline-none mb-4 placeholder:text-[#6F6F6F] p-4 rounded-full"
        />
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleApplyPromoCode}
          disabled={!promoCode}
        >
          {t("activate")}
        </Button>
      </section>
    </article>
  );
};

export default WalletPage;
