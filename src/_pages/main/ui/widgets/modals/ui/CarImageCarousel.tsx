import { ICar } from "@/shared/models/types/car";
import { Button, ProgressIndicator } from "@/shared/ui";
import Loader from "@/shared/ui/loader";
import Image from "next/image";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { formatImage } from "@/shared/utils/formatImage";
import InfoIcon from "@/shared/icons/ui/InfoIcon";
import { ArrowLeftIcon } from "@/shared/icons";
import { ImageViewerPage } from "./ImageViewerPage";

interface CarImageCarouselProps {
  car: ICar;
  showProgressIndicator?: boolean;
  height?: string;
  onBack?: () => void;
  rounded?: boolean;
}

export const CarImageCarousel = ({
  car,
  showProgressIndicator = true,
  height = "h-64",
  onBack,
  rounded = false,
}: CarImageCarouselProps) => {
  const [activeSlide, setActiveSlide] = useState(0);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  console.log("CarImageCarousel", car);

  const [showImageViewer, setShowImageViewer] = useState(false);
  const [initialImageSlide, setInitialImageSlide] = useState(0);

  const photos = car.photos && car.photos.length > 0 ? car.photos : [];

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
        {/* Back Button */}
        {onBack && (
          <Button
            variant="icon"
            onClick={onBack}
            className="absolute left-4 top-10 bg-white z-10"
          >
            <ArrowLeftIcon />
          </Button>
        )}

        <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center">
          <InfoIcon />
          <p className="text-gray-500 text-sm font-medium">Фото недоступно</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative ${height} bg-gray-100 overflow-hidden ${
        rounded ? "rounded-t-[24px]" : ""
      }`}
    >
      {showImageViewer && (
        <ImageViewerPage
          car={car}
          onBack={() => setShowImageViewer(false)}
          initialSlide={initialImageSlide}
        />
      )}

      {/* Back Button */}
      {onBack && (
        <Button
          variant="icon"
          onClick={onBack}
          className="absolute left-4 top-10 bg-white z-10"
        >
          <ArrowLeftIcon />
        </Button>
      )}

      <Swiper
        className="h-full"
        slidesPerView={1}
        onActiveIndexChange={(swiper) => {
          setActiveSlide(swiper.realIndex);
        }}
        onClick={(swiper) => {
          handleImageClick(swiper.activeIndex);
        }}
        loop={photos.length > 1}
      >
        {photos.map((photo, index) => (
          <SwiperSlide key={index} className="h-full relative">
            <div className="h-full w-full cursor-pointer">
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
      {showProgressIndicator && photos.length > 1 && (
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
