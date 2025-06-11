"use client";

import Image from "next/image";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Button, ProgressIndicator } from "@/shared/ui";
import { ROUTES } from "@/shared/constants/routes";
import { useTranslations } from "next-intl";

const OnboardingPage = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const t = useTranslations();

  const slides = t.raw("onboarding.slides");

  return (
    <article className="h-screen overflow-hidden">
      <section className="overflow-hidden rounded-[40px] flex-2">
        <Swiper
          className="h-full"
          slidesPerView={1}
          onActiveIndexChange={(swiper) => {
            setActiveSlide(swiper.realIndex);
          }}
          loop={true}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full">
              <Image
                src={`/images/onboarding/car${index + 1}.png`}
                alt={slide.title}
                width={1000}
                height={1000}
                className="object-contain h-full"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
      <section className="px-10 py-4 pb-10 flex flex-col gap-4 justify-end">
        <div className="flex flex-col gap-4 h-[170px] justify-center">
          <h2 className="text-[26px] leading-[30px]">
            {slides[activeSlide].title}
          </h2>
          <p className="text-[18px] leading-[20px] text-[#CFCFCF]">
            {slides[activeSlide].description}
          </p>
        </div>
        <ProgressIndicator current={activeSlide} total={slides.length} />

        <Button link={ROUTES.AUTH} variant="primary">
          {t("onboarding.login")}
        </Button>
        <p className="text-[12px]">{t("onboarding.termsAgreement")}</p>
      </section>
    </article>
  );
};

export default OnboardingPage;
