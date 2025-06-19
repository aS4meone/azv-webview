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

const AuthPage = () => {
  const { fetchUser, refreshUser } = useUserStore();
  const router = useRouter();
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled =
    activeStep === 0
      ? phone.length !== 10
      : phone.length !== 10 || code.length !== 4;

  const stepText = [
    {
      title: t("auth.phoneNumber.title"),
      description: t("auth.phoneNumber.description"),
    },
    {
      title: t("auth.otp.title"),
      description: `${t("auth.otp.description")} +7 ${formatPhone(phone)}`,
    },
  ];

  const handleNext = async () => {
    if (activeStep === 0) {
      setIsLoading(true);
      const res = await authApi.sendSms("7" + phone);
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

  return (
    <article className="h-screen flex flex-col py-10 bg-[#191919]">
      <DefaultAppBar
        link={activeStep === 0 ? ROUTES.ONBOARDING : undefined}
        onClick={activeStep === 1 ? () => setActiveStep(0) : undefined}
      />
      <div className="px-10 flex flex-col justify-between h-full mt-[20%] text-white">
        <section>
          <h2 className="text-[24px] font-medium mt-2">
            {stepText[activeStep].title}
          </h2>
          <p className="text-[18px] mb-6">{stepText[activeStep].description}</p>
          {activeStep === 0 ? (
            <PhoneInput phone={phone} setPhone={setPhone} />
          ) : (
            <OTPInput
              setCode={setCode}
              onResend={async () => {
                try {
                  const res = await authApi.sendSms(phone);
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
    </article>
  );
};

export default AuthPage;
