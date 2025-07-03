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
      <article className="h-screen overflow-hidden bg-gradient-to-b from-[#0F0F0F] to-[#191919] relative">
        <section className="h-[65vh] overflow-hidden flex items-center justify-center">
          <div className="animate-pulse bg-gray-800/30 w-80 h-80 rounded-2xl backdrop-blur-sm"></div>
        </section>
        <section className="absolute bottom-0 left-0 right-0 px-6 py-8 bg-gradient-to-t from-[#191919] via-[#191919]/95 to-transparent">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3 min-h-[140px] justify-center">
              <div className="animate-pulse bg-gray-700/50 h-8 w-3/4 rounded-lg"></div>
              <div className="animate-pulse bg-gray-700/30 h-5 w-full rounded-lg"></div>
              <div className="animate-pulse bg-gray-700/30 h-5 w-4/5 rounded-lg"></div>
            </div>
            <ProgressIndicator current={0} total={3} />
            <Button disabled variant="primary" className="h-14 rounded-2xl">
              <div className="animate-pulse bg-gray-400/50 h-4 w-16 rounded"></div>
            </Button>
            <div className="animate-pulse bg-gray-700/30 h-3 w-full rounded"></div>
          </div>
        </section>
      </article>
    );
  }

  return (
    <article className="h-screen bg-[#191919] relative overflow-hidden">
      {/* Image Carousel Section */}
      <section className="h-[65vh] md:h-[75vh] lg:h-[80vh] relative">
        <Swiper
          slidesPerView={1}
          onActiveIndexChange={(swiper) => {
            setActiveSlide(swiper.realIndex);
          }}
          loop={true}
          className="h-full w-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#191919]/20 z-10"></div>
              <div className="h-full flex items-center justify-center">
                <Image
                  src={`/images/onboarding/car${index + 1}.png`}
                  alt={slide.title || `Car ${index + 1}`}
                  width={1000}
                  height={1000}
                  className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
                  priority={index === 0}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#191919] to-transparent z-20"></div>
      </section>

      {/* Content Section */}
      <section className="absolute bottom-0 left-0 right-0 px-6 py-8 bg-gradient-to-t from-[#191919] via-[#191919]/98 to-transparent z-30">
        <div className="max-w-md mx-auto flex flex-col gap-6">
          {/* Text Content */}
          <div className="flex flex-col gap-3 min-h-[140px] md:min-h-[100px] justify-center">
            <h2 className="text-2xl font-bold leading-tight text-white tracking-tight">
              {slides[activeSlide]?.title || ""}
            </h2>
            <p className="text-base leading-relaxed text-gray-300 px-2">
              {slides[activeSlide]?.description || ""}
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex justify-center">
            <ProgressIndicator current={activeSlide} total={slides.length} />
          </div>

          {/* Action Button */}
          <Button onClick={() => router.push(ROUTES.AUTH)} variant="primary">
            {t("onboarding.login", "Войти")}
          </Button>

          {/* Terms Text */}
          <p className="text-xs text-gray-400 text-center leading-relaxed px-4">
            {t(
              "onboarding.termsAgreement",
              "Нажимая 'Войти', вы соглашаетесь с Условиями использования и Политикой конфиденциальности."
            )}
          </p>
        </div>
      </section>
    </article>
  );
};

export default OnboardingPage;
