"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Button, ProgressIndicator } from "@/shared/ui";
import { ROUTES } from "@/shared/constants/routes";
import { useRouter } from "next/navigation";
import { useClientTranslations } from "@/shared/utils/useClientTranslations";

const OnboardingPage = () => {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const { t, raw, isClientMounted } = useClientTranslations();

  // Получаем slides с fallback
  const slides = raw("onboarding.slides", [
    { title: "", description: "" },
    { title: "", description: "" },
    { title: "", description: "" },
  ]);

  // Показываем компонент с loading состоянием пока не загрузились переводы
  if (!isClientMounted) {
    return (
      <article className="h-screen overflow-hidden bg-[#191919]">
        <section className="overflow-hidden rounded-[40px] flex-2">
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse bg-gray-800 w-64 h-64 rounded-lg"></div>
          </div>
        </section>
        <section className="px-10 py-4 pb-10 flex flex-col gap-4 justify-end">
          <div className="flex flex-col gap-2 h-[165px] justify-center text-white">
            <div className="animate-pulse bg-gray-800 h-8 w-3/4 rounded"></div>
            <div className="animate-pulse bg-gray-800 h-5 w-full rounded mt-2"></div>
          </div>
          <ProgressIndicator current={0} total={3} />
          <Button disabled variant="primary">
            <div className="animate-pulse bg-gray-400 h-4 w-16 rounded"></div>
          </Button>
          <div className="animate-pulse bg-gray-800 h-3 w-full rounded"></div>
        </section>
      </article>
    );
  }

  return (
    <article className="h-screen overflow-hidden bg-[#191919]">
      <section className="overflow-hidden rounded-[40px] flex-2">
        <Swiper
          className="h-full"
          slidesPerView={1}
          onActiveIndexChange={(swiper) => {
            setActiveSlide(swiper.realIndex);
          }}
          loop={true}
        >
          {slides.map(
            (slide: { title: string; description: string }, index: number) => (
              <SwiperSlide key={index} className="h-full">
                <Image
                  src={`/images/onboarding/car${index + 1}.png`}
                  alt={slide.title || `Car ${index + 1}`}
                  width={1000}
                  height={1000}
                  className="object-contain h-full"
                />
              </SwiperSlide>
            )
          )}
        </Swiper>
      </section>
      <section className="px-10 py-4 pb-10 flex flex-col gap-4 justify-end">
        <div className="flex flex-col gap-2 h-[165px] justify-center text-white">
          <h2 className="text-[24px] leading-[30px]">
            {slides[activeSlide]?.title || ""}
          </h2>
          <p className="text-[18px] leading-[20px] text-[#CFCFCF]">
            {slides[activeSlide]?.description || ""}
          </p>
        </div>
        <ProgressIndicator current={activeSlide} total={slides.length} />

        <Button onClick={() => router.push(ROUTES.AUTH)} variant="primary">
          {t("onboarding.login", "Войти")}
        </Button>
        <p className="text-[12px] text-white">
          {t(
            "onboarding.termsAgreement",
            "Нажимая 'Войти', вы соглашаетесь с Условиями использования и Политикой конфиденциальности."
          )}
        </p>
      </section>
    </article>
  );
};

export default OnboardingPage;
