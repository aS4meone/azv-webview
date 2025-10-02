"use client";

import React from "react";
import { ILastClientReview, ICar } from "@/shared/models/types/car";
import { ThumbsUpIcon, ThumbsDownIcon } from "@/shared/icons";

interface ClientReviewSectionProps {
  review: ILastClientReview;
  car: ICar;
  currentMechanicId?: number | null;
}

export const ClientReviewSection: React.FC<ClientReviewSectionProps> = ({ review, car, currentMechanicId }) => {
  const renderStars = (rating: number) => {
    const stars: React.ReactElement[] = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`text-base ${
            i <= rating ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  const getRatingIcon = (rating: number) => {
    if (rating >= 4) {
      return <ThumbsUpIcon />;
    } else {
      return <ThumbsDownIcon />;
    }
  };

  const getImageUrl = (photoPath: string) => {
    // Если путь уже содержит полный URL, используем его
    if (photoPath.startsWith('http')) {
      return photoPath;
    }
    // Иначе добавляем базовый URL
    return `https://api.azvmotors.kz/${photoPath}`;
  };

  // Проверяем, осматривает ли текущий механик эту машину
  const isMechanicInspecting = car?.status === "IN_USE" && 
    car?.current_renter_id === currentMechanicId;

  return (
    <div className="bg-[#A1C7FF33] rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-[#191919]">
            {isMechanicInspecting ? "Информация для осмотра" : "Отзыв последнего клиента"}
          </h3>
          {isMechanicInspecting && (
            <span className="text-xs text-green-600 font-medium">
              Вы осматриваете этот автомобиль
            </span>
          )}
        </div>
        {getRatingIcon(review.rating)}
      </div>

      {/* Специальная информация для механика */}
      {isMechanicInspecting ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-green-800">
              Статус осмотра: Активен
            </span>
          </div>
          <p className="text-xs text-green-700">
            Используйте эту информацию как справочную при осмотре автомобиля
          </p>
        </div>
      ) : (
        /* Рейтинг */
        <div className="flex items-center gap-2 bg-white rounded-lg py-2 px-3">
          <span className="text-sm font-medium text-[#191919]">Рейтинг:</span>
          <div className="flex items-center gap-1">
            {renderStars(review.rating)}
            <span className="ml-2 text-sm text-[#191919]">({review.rating}/5)</span>
          </div>
        </div>
      )}

      {/* Комментарий */}
      {review.comment && (
        <div className="bg-white rounded-lg p-3">
          <span className="text-sm font-medium text-[#191919] block mb-2">
            {isMechanicInspecting ? "Комментарий клиента:" : "Комментарий:"}
          </span>
          <p className="text-sm text-[#191919] leading-relaxed">
            {review.comment}
          </p>
          {isMechanicInspecting && (
            <p className="text-xs text-gray-500 mt-2 italic">
              Учтите этот отзыв при осмотре автомобиля
            </p>
          )}
        </div>
      )}

      {/* Фотографии после аренды */}
      {review.photos_after && (
        <div className="space-y-3">
          {/* Фото салона */}
          {review.photos_after.interior && review.photos_after.interior.length > 0 && (
            <div className="bg-white rounded-lg p-3">
              <span className="text-sm font-medium text-[#191919] block mb-3">
                Фото салона после аренды
              </span>
              <div className="grid grid-cols-2 gap-2">
                {review.photos_after.interior.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getImageUrl(photo)}
                      alt={`Салон ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Фото кузова */}
          {review.photos_after.exterior && review.photos_after.exterior.length > 0 && (
            <div className="bg-white rounded-lg p-3">
              <span className="text-sm font-medium text-[#191919] block mb-3">
                Фото кузова после аренды
              </span>
              <div className="grid grid-cols-2 gap-2">
                {review.photos_after.exterior.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={getImageUrl(photo)}
                      alt={`Кузов ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder-car.jpg';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
