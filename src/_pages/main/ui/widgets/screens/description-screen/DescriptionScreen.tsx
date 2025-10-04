import { ICar } from "@/shared/models/types/car";
import React, { useState } from "react";
import PushScreen from "@/shared/ui/push-screen";
import { Button } from "@/shared/ui";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import { formatImage } from "@/shared/utils/formatImage";
import "swiper/css";

interface DescriptionScreenProps {
  car: ICar;
  onClose: () => void;
}

export const DescriptionScreen = ({ car, onClose }: DescriptionScreenProps) => {
  const t = useTranslations();
  const [activeInteriorSlide, setActiveInteriorSlide] = useState(0);
  const [activeExteriorSlide, setActiveExteriorSlide] = useState(0);
  
  // Получаем данные отзыва последнего клиента
  const lastClientReview = car.last_client_review;
  
  // Разделяем фотографии по типам
  const interiorPhotos = lastClientReview?.photos_after?.interior || [];
  const exteriorPhotos = lastClientReview?.photos_after?.exterior || [];
  
  // Компонент для отображения фотографий (одна или несколько со слайдером)
  const PhotoSection = ({ photos, title, activeSlide, setActiveSlide }: {
    photos: string[];
    title: string;
    activeSlide: number;
    setActiveSlide: (slide: number) => void;
  }) => {
    if (photos.length === 0) return null;
    
    return (
      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700">
          {title} ({photos.length} {t("widgets.screens.description.photosCount")})
        </h5>
        <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
          {photos.length === 1 ? (
            // Если одна фотография - показываем без слайдера
            <div className="h-full w-full relative">
              <Image
                src={formatImage(photos[0])}
                alt={`${title} фото`}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            // Если несколько фотографий - показываем слайдер
            <>
              <Swiper
                className="h-full"
                slidesPerView={1}
                onActiveIndexChange={(swiper) => {
                  setActiveSlide(swiper.realIndex);
                }}
                loop={photos.length > 1}
                allowTouchMove
                grabCursor
              >
                {photos.map((photo, index) => (
                  <SwiperSlide key={index} className="h-full relative">
                    <div className="h-full w-full relative">
                      <Image
                        src={formatImage(photo)}
                        alt={`${title} фото ${index + 1}`}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              
              {/* Индикатор слайдов */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 z-10">
                <div className="flex space-x-2">
                  {photos.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === activeSlide
                          ? 'bg-white'
                          : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <PushScreen onClose={onClose} withCloseButton={true}>
      <div className="space-y-6 pb-6">
        {/* Заголовок */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("widgets.screens.description.carDescription")}
          </h1>
          <p className="text-gray-600">{t("widgets.screens.description.carInfo")} {car.name}</p>
        </div>

        {/* Описание автомобиля */}
        {car.description && (
          <div className="text-center text-gray-500 p-4 bg-gray-100 rounded-lg">
            <p>{car.description}</p>
          </div>
        )}

        {/* Отзыв последнего клиента */}
        {lastClientReview && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                {t("widgets.screens.description.lastClientReview")}
              </h3>
              
              {/* Рейтинг и комментарий */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xl ${
                          i < lastClientReview.rating
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {lastClientReview.rating}/5
                  </span>
                </div>
                
                {lastClientReview.comment && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-gray-700 text-sm">
                      "{lastClientReview.comment}"
                    </p>
                  </div>
                )}
              </div>
              
              {/* Фотографии после аренды */}
              {(interiorPhotos.length > 0 || exteriorPhotos.length > 0) && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-800">
                    {t("widgets.screens.description.photosAfterRental")}
                  </h4>
                  
                  {/* Фотографии салона */}
                  <PhotoSection
                    photos={interiorPhotos}
                    title={t("widgets.screens.description.interior")}
                    activeSlide={activeInteriorSlide}
                    setActiveSlide={setActiveInteriorSlide}
                  />
                  
                  {/* Фотографии кузова */}
                  <PhotoSection
                    photos={exteriorPhotos}
                    title={t("widgets.screens.description.exterior")}
                    activeSlide={activeExteriorSlide}
                    setActiveSlide={setActiveExteriorSlide}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <Button variant="secondary" onClick={onClose} className="w-full">
          {t("widgets.screens.description.backToMap")}
        </Button>
      </div>
    </PushScreen>
  );
};
