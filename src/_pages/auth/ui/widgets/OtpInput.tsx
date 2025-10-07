import React, { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";

const OTP_LENGTH = 4;

const OTPInput = ({
  onResend,

  setCode,
}: {
  onResend: () => void;

  setCode: (code: string) => void;
}) => {
  const t = useTranslations();
  const [otp, setOtp] = useState<string>("");
  const [timer, setTimer] = useState(59);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Prevent screen dragging (touchmove) when OTPInput is mounted
  useEffect(() => {
    const preventTouchMove = (e: TouchEvent) => e.preventDefault();
    const node = containerRef.current;
    if (node) {
      node.addEventListener("touchmove", preventTouchMove, { passive: false });
    }
    return () => {
      if (node) {
        node.removeEventListener("touchmove", preventTouchMove);
      }
    };
  }, []);

  const handleChange = (value: string) => {
    // Extract only digits from the input
    const digits = value.replace(/\D/g, "").slice(0, OTP_LENGTH);
    setOtp(digits);
    setCode(digits);
  };

  const handleResend = () => {
    onResend();
    setOtp("");
    setTimer(59);
  };

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between otp-container relative" style={{ height: '60px' }}>
        {/* Visual boxes overlay */}
        <div className="absolute inset-0 flex items-center justify-between pointer-events-none">
          {[0, 1, 2, 3].map((index) => {
            const hasValue = otp[index];
            const isActive = otp.length === index; // Активная позиция для ввода
            
            return (
              <React.Fragment key={index}>
                {index === 2 && (
                  <div className="h-[6px] w-[6px] rounded-full bg-white"></div>
                )}
                <div
                  className={`w-[60px] h-[60px] text-[16px] text-center rounded-[20px] flex items-center justify-center transition-all ${
                    hasValue 
                      ? 'bg-[#292929] text-white' 
                      : isActive 
                        ? 'bg-[#292929] outline outline-2 outline-[#6CB1FF] text-white' 
                        : 'bg-[#292929] text-white'
                  }`}
                >
                  <span>{otp[index] || ''}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Actual input - transparent overlay */}
        <input
          type="text"
          name="otp"
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={OTP_LENGTH}
          value={otp}
          onChange={(e) => handleChange(e.target.value)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-text"
          style={{ zIndex: 30 }}
          autoFocus
        />
      </div>

      <div className="text-[16px] text-white mt-6">
        {timer > 0 ? (
          <>
            {t("auth.otp.resendCode")}{" "}
            <span className="text-[#6CB1FF]">{timer}</span>{" "}
            {t("auth.otp.seconds")}
          </>
        ) : (
          <button
            onClick={handleResend}
            className="text-[16px] text-[#6CB1FF] underline underline-offset-4 cursor-pointer"
          >
            {t("auth.otp.sendCode")}
          </button>
        )}
      </div>
    </div>
  );
};

export { OTPInput };
