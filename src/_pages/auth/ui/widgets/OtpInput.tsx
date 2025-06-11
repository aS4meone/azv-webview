import React, { useState, useRef, useEffect, Fragment } from "react";
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
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(59);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
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

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // только цифры или пусто
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setCode(newOtp.join(""));

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus({ preventScroll: true });
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus({ preventScroll: true });
    }
  };

  const handleResend = () => {
    onResend();
    setOtp(Array(OTP_LENGTH).fill(""));
    setTimer(59);
  };

  return (
    <div ref={containerRef}>
      <div className="flex items-center justify-between otp-container">
        {otp.map((digit, index) => (
          <Fragment key={index}>
            {index === 2 && (
              <div className="h-[6px] w-[6px] rounded-full bg-white"></div>
            )}
            <input
              key={index}
              ref={(el) => {
                if (el) {
                  inputsRef.current[index] = el;
                }
              }}
              type="text"
              name="otp"
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              className=" w-[60px] h-[60px] text-[16px] text-center rounded-[20px] bg-[#292929] focus:outline-2 text-white border-none focus:outline-[#6CB1FF]"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => {
                e.preventDefault();
              }}
            />
          </Fragment>
        ))}
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
