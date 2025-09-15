"use client";
import { DefaultAppBar } from "@/widgets/appbars";
import { ROUTES } from "@/shared/constants/routes";
import { useState } from "react";
import { Button, ProgressIndicator } from "@/shared/ui";
import { PhoneInput } from "../widgets/PhoneInput";
import { formatPhone } from "@/shared/utils/formatPhone";
import { OTPInput } from "../widgets/OtpInput";
import { setTokens } from "@/shared/utils/tokenStorage";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { authApi } from "@/shared/api/routes/auth";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";
import { useUserStore } from "@/shared/stores/userStore";
import Loader from "@/shared/ui/loader";
import { ContractModal } from "@/_pages/main/ui/widgets/modals/user/ContractModal";

const RegistrationPage = () => {
  const { fetchUser, refreshUser } = useUserStore();
  const router = useRouter();
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const isDisabled =
    activeStep === 0
      ? phone.length !== 10 || !firstName.trim() || !lastName.trim()
      : phone.length !== 10 || code.length !== 4;

  const stepText = [
    {
      title: t("auth.registrationPage.title"),
      description: t("auth.registrationPage.description"),
    },
    {
      title: t("auth.otp.title"),
      description: `${t("auth.otp.description")} +7 ${formatPhone(phone)}`,
    },
  ];

  const handleBack = () => {
    if (activeStep === 0) {
      router.push(ROUTES.AUTH);
    } else {
      setActiveStep(0);
    }
  };

  const handleNext = async () => {
    if (activeStep === 0) {
      // Показываем контрактный модал перед отправкой SMS
      setIsContractModalOpen(true);
    } else {
      setIsLoading(true);
      const res = await authApi.verifySms("7" + phone, code);
      if (res.statusCode === 200) {
        setTokens({
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
        });
        fetchUser();
        router.push(ROUTES.MAIN);
        refreshUser();
        setIsLoading(false);
      } else {
        showModal({
          type: "error",
          title: t("error"),
          description: res.error,
          buttonText: t("modal.error.button"),
        });
        setIsLoading(false);
      }
    }
  };

  const handleContractAccept = async () => {
    setIsContractModalOpen(false);
    setIsLoading(true);

    const res = await authApi.sendSmsWithRegistration("7" + phone, firstName.trim(), lastName.trim());
    if (res.statusCode === 200) {
      setActiveStep(1);
      setIsLoading(false);
    } else {
      showModal({
        type: "error",
        title: t("error"),
        description: res.error,
        buttonText: t("modal.error.button"),
      });
      setIsLoading(false);
    }
  };

  const handleContractReject = () => {
    setIsContractModalOpen(false);
    // Остаемся на том же экране - пользователь может попробовать снова
  };

  return (
    <article className="h-screen flex flex-col py-10 bg-[#191919]">
      <DefaultAppBar onClick={handleBack} />
      <div className="px-10 flex flex-col justify-between h-full mt-[20%] text-white">
        <section>
          <h2 className="text-[24px] font-medium mt-2">
            {stepText[activeStep].title}
          </h2>
          <p className="text-[18px] mb-6">{stepText[activeStep].description}</p>
          {activeStep === 0 ? (
            <div className="space-y-4">
              <PhoneInput phone={phone} setPhone={setPhone} />
              <div className="space-y-4">
                <div className="w-full bg-[#292929] rounded-[20px] h-[60px] text-white">
                  <input
                    className="w-full outline-none bg-transparent p-4 text-[16px] text-white placeholder:text-white/30 rounded-[20px]"
                    placeholder={t("auth.registrationPage.firstNamePlaceholder")}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="w-full bg-[#292929] rounded-[20px] h-[60px] text-white">
                  <input
                    className="w-full outline-none bg-transparent p-4 text-[16px] text-white placeholder:text-white/30 rounded-[20px]"
                    placeholder={t("auth.registrationPage.lastNamePlaceholder")}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <OTPInput
              setCode={setCode}
              onResend={async () => {
                try {
                  const res = await authApi.sendSmsWithRegistration("7" + phone, firstName.trim(), lastName.trim());
                  if (res.statusCode !== 200) {
                    showModal({
                      type: "error",
                      title: t("error"),
                      description: res.error,
                      buttonText: t("modal.error.button"),
                    });
                  }
                } catch (error) {
                  showModal({
                    type: "error",
                    title: t("error"),
                    description: error.response.data.detail,
                    buttonText: t("modal.error.button"),
                  });
                }
              }}
            />
          )}
        </section>
        <section className="flex flex-col gap-6">
          <ProgressIndicator current={activeStep} total={2} />
          <Button
            variant="primary"
            disabled={isDisabled || isLoading}
            onClick={handleNext}
          >
            {isLoading ? <Loader color="black" /> : t("auth.next")}
          </Button>
        </section>
      </div>

      {/* Контрактный модал */}
      <ContractModal
        isOpen={isContractModalOpen}
        onClose={() => setIsContractModalOpen(false)}
        onAccept={handleContractAccept}
        onReject={handleContractReject}
        title={t("contract.title")}
      />
    </article>
  );
};

export default RegistrationPage;
