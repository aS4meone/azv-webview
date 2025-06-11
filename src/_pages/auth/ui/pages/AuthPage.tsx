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

interface ErrorResponse {
  detail: string;
}

const AuthPage = () => {
  const { fetchUser } = useUserStore();
  const router = useRouter();
  const t = useTranslations();
  const { showModal } = useResponseModal();
  const [activeStep, setActiveStep] = useState(0);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

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
      const res = await authApi.sendSms(phone);
      if (res.statusCode === 200) {
        setActiveStep(1);
      } else {
        console.log(res);
        showModal({
          type: "error",
          title: t("error"),
          description: res.error,
          buttonText: t("modal.error.button"),
        });
      }
    } else {
      const res = await authApi.verifySms(phone, code);
      if (res.statusCode === 200) {
        setTokens({
          accessToken: res.data.access_token,
          refreshToken: res.data.refresh_token,
        });
        fetchUser();
        router.push(ROUTES.MAIN);
      } else {
        showModal({
          type: "error",
          title: t("error"),
          description: res.error,
          buttonText: t("modal.error.button"),
        });
      }
    }
  };

  return (
    <article className="h-screen flex flex-col py-10">
      <DefaultAppBar
        link={activeStep === 0 ? ROUTES.ONBOARDING : undefined}
        onClick={activeStep === 1 ? () => setActiveStep(0) : undefined}
      />
      <div className="px-10 flex flex-col justify-between h-full mt-[20%]">
        <section>
          <h2 className="text-[24px] font-medium mt-2">
            {stepText[activeStep].title}
          </h2>
          <p className="text-[18px] mb-6">{stepText[activeStep].description}</p>
          {activeStep === 0 ? (
            <PhoneInput phone={phone} setPhone={setPhone} />
          ) : (
            <OTPInput
              code={code}
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
                } catch (error) {}
              }}
            />
          )}
        </section>
        <section className="flex flex-col gap-6">
          <ProgressIndicator current={activeStep} total={2} />
          <Button variant="primary" disabled={isDisabled} onClick={handleNext}>
            {t("auth.next")}
          </Button>
        </section>
      </div>
    </article>
  );
};

export default AuthPage;
