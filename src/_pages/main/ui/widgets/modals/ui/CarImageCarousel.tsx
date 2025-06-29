import { ICar } from "@/shared/models/types/car";
import { Button, ProgressIndicator } from "@/shared/ui";
import Loader from "@/shared/ui/loader";
import Image from "next/image";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import { formatImage } from "@/shared/utils/formatImage";
import InfoIcon from "@/shared/icons/ui/InfoIcon";
import { ImageViewerPage } from "./ImageViewerPage";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";

interface CarImageCarouselProps {
  car: ICar;
  height?: string;
  rounded?: boolean;
}

export const CarImageCarousel = ({
  car,
  height = "h-64",
  rounded = false,
}: CarImageCarouselProps) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const swiperRef = useRef<SwiperType | null>(null);

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [initialImageSlide, setInitialImageSlide] = useState(0);

  const photos = car.photos && car.photos.length > 0 ? car.photos : [];

  // Автоскролл
  useEffect(() => {
    if (photos.length <= 1 || !swiperRef.current) return;

    const interval = setInterval(() => {
      if (swiperRef.current) {
        swiperRef.current.slideNext();
      }
    }, 3000); // Смена слайда каждые 3 секунды

    return () => clearInterval(interval);
  }, [photos.length]);

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
    setImageLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageLoad = (index: number) => {
    setImageLoading((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageLoadStart = (index: number) => {
    setImageLoading((prev) => ({ ...prev, [index]: true }));
  };

  const handleImageClick = (slideIndex: number) => {
    setInitialImageSlide(slideIndex);
    setShowImageViewer(true);
  };

  // Если нет фотографий, показываем заглушку сразу
  if (photos.length === 0) {
    return (
      <div
        className={`relative ${height} bg-gray-100 overflow-hidden ${
          rounded ? "rounded-t-[24px]" : ""
        }`}
      >
        <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
          <InfoIcon />
          <p className="text-gray-500 text-sm font-medium">Фото недоступно</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${height} bg-gray-100  ${
        rounded ? "rounded-t-[24px]" : ""
      }`}
    >
      <CustomPushScreen
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        direction="bottom"
        isCloseable={false}
        className="bg-black p-0"
      >
        <Button
          onClick={() => setShowImageViewer(false)}
          variant="icon"
          className="ml-auto absolute right-4 top-10 z-10"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6 6L18 18"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Button>
        <ImageViewerPage
          car={car}
          onBack={() => setShowImageViewer(false)}
          initialSlide={initialImageSlide}
        />
      </CustomPushScreen>

      <Swiper
        className="h-full"
        slidesPerView={1}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onActiveIndexChange={(swiper) => {
          setActiveSlide(swiper.realIndex);
        }}
        loop={photos.length > 1}
        allowTouchMove={false}
      >
        {photos.map((photo, index) => (
          <SwiperSlide key={index} className="h-full relative">
            <div
              className="h-full w-full cursor-pointer"
              onClick={() => {
                handleImageClick(index);
              }}
            >
              {imageErrors[index] ? (
                // Показываем заглушку если изображение не загрузилось
                <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
                  <InfoIcon />
                  <p className="text-gray-500 text-sm font-medium">
                    Фото недоступно
                  </p>
                </div>
              ) : (
                <>
                  {imageLoading[index] && (
                    // Показываем индикатор загрузки
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-10">
                      <Loader color="#191919" />
                    </div>
                  )}
                  <Image
                    src={formatImage(photo)}
                    alt={`${car.name} - фото ${index + 1}`}
                    fill
                    className="object-cover"
                    onError={() => handleImageError(index)}
                    onLoad={() => handleImageLoad(index)}
                    onLoadStart={() => handleImageLoadStart(index)}
                  />
                </>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Progress Indicator - Bottom */}
      {photos.length > 1 && (
        <div className="my-2 px-4">
          <ProgressIndicator
            current={activeSlide}
            total={photos.length}
            activeColor="#191919"
            inactiveColor="#D3D3D3"
          />
        </div>
      )}
    </div>
  );
};
