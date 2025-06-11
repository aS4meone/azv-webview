import { ICar } from "@/shared/models/types/car";
import { ProgressIndicator } from "@/shared/ui";
import Image from "next/image";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom } from "swiper/modules";
import "swiper/css";
import "swiper/css/zoom";
import { formatImage } from "@/shared/utils/formatImage";
import InfoIcon from "@/shared/icons/ui/InfoIcon";

interface ImageViewerPageProps {
  car: ICar;
  onBack: () => void;
  initialSlide?: number;
}

export const ImageViewerPage = ({
  car,
  onBack,
  initialSlide = 0,
}: ImageViewerPageProps) => {
  const [activeSlide, setActiveSlide] = useState(initialSlide);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>(
    {}
  );

  // Prepare photos array
  const photos =
    car.photos && car.photos.length > 0
      ? car.photos
      : ["/images/car-placeholder.jpg"];

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

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="relative z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4 pt-12">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M15 18L9 12L15 6"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Car Name */}
          <h1 className="text-white text-lg font-medium">{car.name}</h1>

          {/* Progress Indicator */}
          {photos.length > 1 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">
                {activeSlide + 1} / {photos.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Image Viewer */}
      <div className="flex-1 relative">
        <Swiper
          className="h-full w-full"
          slidesPerView={1}
          initialSlide={initialSlide}
          onActiveIndexChange={(swiper) => {
            setActiveSlide(swiper.realIndex);
          }}
          loop={photos.length > 1}
          zoom={{
            maxRatio: 3,
            minRatio: 1,
          }}
          modules={[Zoom]}
        >
          {photos.map((photo, index) => (
            <SwiperSlide key={index} className="h-full relative">
              <div className="swiper-zoom-container h-full w-full flex items-center justify-center">
                {imageErrors[index] ? (
                  // Показываем заглушку если изображение не загрузилось
                  <div className="w-full h-full bg-gray-800 flex flex-col items-center justify-center">
                    <InfoIcon />
                    <p className="text-white text-sm font-medium mt-2">
                      Фото недоступно
                    </p>
                  </div>
                ) : (
                  <>
                    {imageLoading[index] && (
                      // Показываем индикатор загрузки
                      <div className="absolute inset-0 bg-black flex items-center justify-center z-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                      </div>
                    )}
                    <Image
                      src={formatImage(photo)}
                      alt={`${car.name} - фото ${index + 1}`}
                      fill
                      className="object-contain"
                      onError={() => handleImageError(index)}
                      onLoad={() => handleImageLoad(index)}
                      onLoadStart={() => handleImageLoadStart(index)}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  </>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Bottom Controls */}
      {photos.length > 1 && (
        <div className="relative z-10 bg-gradient-to-t from-black/50 to-transparent">
          <div className="p-4 pb-8">
            <ProgressIndicator
              current={activeSlide}
              total={photos.length}
              activeColor="#ffffff"
              inactiveColor="rgba(255, 255, 255, 0.3)"
            />
          </div>
        </div>
      )}

      {/* Instruction Text */}
      <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10">
        <p className="text-white/70 text-sm text-center">
          Нажмите дважды для увеличения
        </p>
      </div>
    </div>
  );
};
