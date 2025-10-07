import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/shared/ui";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import Loader from "@/shared/ui/loader";
import { useTranslations } from "next-intl";
import { authApi } from "@/shared/api/routes/auth";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  email: string;
}

export const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  email,
}) => {
  const t = useTranslations("profile");
  const { showModal } = useResponseModal();
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setCode("");
      setCanResend(false);
      setResendTimer(60);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!canResend && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const handleCodeChange = (value: string) => {
    // Extract only digits from the input
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    
    // Auto-verify when all 6 digits are entered
    if (digits.length === 6) {
      setTimeout(() => {
        handleVerify(digits);
      }, 100);
    }
  };

  const handleVerify = async (verificationCode?: string) => {
    const codeToVerify = verificationCode || code;
    
    if (codeToVerify.length !== 6) {
      showModal({
        type: "error",
        title: t("error"),
        description: t("emailVerification.invalidCodeLength"),
        buttonText: t("understood"),
      });
      return;
    }

    setIsLoading(true);
    const res = await authApi.verifyEmail(codeToVerify);

    if (res.statusCode === 200) {
      showModal({
        type: "success",
        title: t("success"),
        description: t("emailVerification.successMessage"),
        buttonText: t("understood"),
        onButtonClick: () => {
          onSuccess();
        },
      });
    } else {
      showModal({
        type: "error",
        title: t("error"),
        description: res.error || t("emailVerification.verificationFailed"),
        buttonText: t("understood"),
      });
    }
    setIsLoading(false);
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    const res = await authApi.resendEmailCode();

    if (res.statusCode === 200) {
      setCanResend(false);
      setResendTimer(60);
      showModal({
        type: "success",
        title: t("success"),
        description: t("emailVerification.codeSent"),
        buttonText: t("understood"),
      });
    } else {
      showModal({
        type: "error",
        title: t("error"),
        description: res.error || t("emailVerification.resendFailed"),
        buttonText: t("understood"),
      });
    }
    setIsLoading(false);
  };

  return isOpen && typeof window !== "undefined"
    ? createPortal(
        <CustomPushScreen
          isOpen={true}
          onClose={onClose}
          direction="bottom"
          withHeader={true}
          title={t("emailVerification.title")}
        >
          <div className="bg-white min-h-full p-6 mt-10">
            <div className="mb-6 text-center">
              <p className="text-gray-700 mb-2">
                {t("emailVerification.description")}
              </p>
              <p className="text-lg font-semibold text-[#191919]">{email}</p>
            </div>

            {/* Code input with visual separation */}
            <div className="mb-6 relative">
              <div className="relative mx-auto" style={{ width: '320px', height: '56px' }}>
                {/* Visual boxes overlay */}
                <div className="absolute inset-0 flex justify-center gap-2 pointer-events-none z-10">
                  {[0, 1, 2, 3, 4, 5].map((index) => {
                    const hasValue = code[index];
                    const isActive = code.length === index; // Активная позиция для ввода
                    
                    return (
                      <div
                        key={index}
                        className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-semibold transition-all ${
                          hasValue 
                            ? 'border-[#191919] bg-gray-50' 
                            : isActive 
                              ? 'border-[#191919] bg-white shadow-sm' 
                              : 'border-gray-300 bg-white'
                        }`}
                      >
                        <span className="text-gray-800">{code[index] || ''}</span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Actual input */}
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={code}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
                  disabled={isLoading}
                  placeholder="000000"
                  autoFocus
                />
              </div>
            </div>

            {/* Resend button */}
            <div className="text-center mb-6">
              <button
                onClick={handleResend}
                disabled={!canResend || isLoading}
                className={`text-sm ${
                  canResend
                    ? "text-[#191919] underline cursor-pointer"
                    : "text-gray-400 cursor-not-allowed"
                }`}
              >
                {canResend
                  ? t("emailVerification.resendCode")
                  : `${t("emailVerification.resendIn")} ${resendTimer}${t("emailVerification.seconds")}`}
              </button>
            </div>

            {/* Verify button */}
            <Button
              variant="secondary"
              onClick={() => handleVerify()}
              disabled={code.length !== 6 || isLoading}
              className="w-full"
            >
              {isLoading ? <Loader color="#fff" /> : t("emailVerification.verify")}
            </Button>
          </div>
        </CustomPushScreen>,
        document.body
      )
    : null;
};

