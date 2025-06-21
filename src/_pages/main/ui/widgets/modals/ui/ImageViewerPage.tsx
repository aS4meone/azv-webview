import { ICar } from "@/shared/models/types/car";
import { ProgressIndicator } from "@/shared/ui";
import Image from "next/image";
import React, { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import type { SwiperRef } from "swiper/react";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { formatImage } from "@/shared/utils/formatImage";
import InfoIcon from "@/shared/icons/ui/InfoIcon";

interface ImageViewerPageProps {
  car: ICar;
  onBack: () => void;
  initialSlide?: number;
}

export const ImageViewerPage = ({
  car,
  initialSlide = 0,
}: ImageViewerPageProps) => {
  const [activeSlide, setActiveSlide] = useState(initialSlide);
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [isZoomed, setIsZoomed] = useState(false);
  const swiperRef = useRef<SwiperRef | null>(null);

  // Prepare photos array
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

  const handleZoomChange = (swiper: SwiperType, scale: number) => {
    const isCurrentlyZoomed = scale > 1;
    setIsZoomed(isCurrentlyZoomed);

    // Отключаем allowTouchMove при зуме
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.allowTouchMove = !isCurrentlyZoomed;
    }
  };

  return (
    <div className="h-full bg-black flex flex-col">
      <div className="relative bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between p-4 pt-12">
          {photos.length > 1 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <span className="text-white text-sm font-medium">
                {activeSlide + 1} / {photos.length}
              </span>
            </div>
          )}

          {/* Car Name */}
          <h1 className="text-white text-lg font-medium">{car.name}</h1>

          <div className="w-10"></div>
        </div>
      </div>

      {/* Image Viewer */}
      <div className="flex-1 relative">
        <Swiper
          ref={swiperRef}
          className="h-full w-full"
          slidesPerView={1}
          spaceBetween={0}
          initialSlide={initialSlide}
          onActiveIndexChange={(swiper) => {
            setActiveSlide(swiper.realIndex);
          }}
          onZoomChange={handleZoomChange}
          loop={photos.length > 1}
          zoom={{
            maxRatio: 3,
            minRatio: 1,
            toggle: true,
          }}
          modules={[Zoom, Navigation, Pagination]}
          touchRatio={1}
          threshold={10}
          allowTouchMove={!isZoomed}
          simulateTouch={true}
          grabCursor={!isZoomed}
          resistance={true}
          resistanceRatio={0}
          preventClicks={isZoomed}
          preventClicksPropagation={isZoomed}
          touchStartPreventDefault={false}
          touchMoveStopPropagation={isZoomed}
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
                      className="object-contain select-none"
                      onError={() => handleImageError(index)}
                      onLoad={() => handleImageLoad(index)}
                      onLoadStart={() => handleImageLoadStart(index)}
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                      draggable={false}
                      priority={index === initialSlide}
                      style={{ pointerEvents: isZoomed ? "auto" : "none" }}
                    />
                  </>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Bottom Controls */}
      {photos.length > 1 && !isZoomed && (
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
      {!isZoomed && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10">
          <p className="text-white/70 text-sm text-center">
            Приближайте пальцами
          </p>
        </div>
      )}
    </div>
  );
};
