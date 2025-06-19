import { ICar } from "@/shared/models/types/car";
import React from "react";
import PushScreen from "@/shared/ui/push-screen";
import { Button } from "@/shared/ui";
import Image from "next/image";
import { formatImage } from "@/shared/utils/formatImage";
import { formatPhone } from "@/_pages/profile/ui/widgets/UserData";
import InfoIcon from "@/shared/icons/ui/InfoIcon";

interface TrackingDataScreenProps {
  car: ICar;
  onClose: () => void;
}

// Вспомогательный компонент для отображения фото или заглушки
const RenterPhoto = ({
  src,
  alt,
  label,
}: {
  src?: string;
  alt: string;
  label: string;
}) => (
  <div className="flex flex-col items-center justify-end space-y-2">
    {src ? (
      <Image
        src={formatImage(src)}
        alt={alt}
        width={100}
        height={100}
        className={`rounded-lg h-[200px] w-full border border-gray-200 object-cover`}
      />
    ) : (
      <div className="h-[200px] w-full p-8 bg-gray-200 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
        <InfoIcon />
        <p className="text-gray-500 text-xs">Нет фото</p>
      </div>
    )}
    <span className="text-sm text-gray-600 text-center">{label}</span>
  </div>
);

export const TrackingDataScreen = ({
  car,
  onClose,
}: TrackingDataScreenProps) => {
  return (
    <PushScreen onClose={onClose} withCloseButton={true} closeOnScroll>
      <div className="space-y-6">
        {/* Заголовок */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Данные слежки</h1>
          <p className="text-gray-600">
            Информация о слежке за автомобилем {car.name}
          </p>
        </div>

        {/* Изображения арендатора */}
        <div className="flex justify-center items-end w-full h-full">
          {car.current_renter_details &&
          (car.current_renter_details.rent_selfie_url ||
            car.current_renter_details.selfie_url) ? (
            <div className="flex justify-center items-end gap-6 w-full">
              <RenterPhoto
                src={car.current_renter_details.rent_selfie_url}
                alt="Селфи при аренде"
                label="Селфи при аренде"
              />
              <RenterPhoto
                src={car.current_renter_details.selfie_url}
                alt="Селфи профиля"
                label="Селфи профиля"
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 flex flex-col items-center justify-center">
              <InfoIcon />
              <p className="text-gray-500 text-sm font-medium mt-2">
                Фотографии арендатора недоступны
              </p>
            </div>
          )}
        </div>

        {/* Данные арендатора (если есть) */}
        {car.current_renter_details && (
          <div className="bg-green-50 rounded-lg p-4 space-y-3">
            <h2 className="font-semibold text-gray-900">Арендатор</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-[#191919]">Имя:</span>
                <p className="font-medium text-[#191919]">
                  {car.current_renter_details.full_name}
                </p>
              </div>
              <div>
                <span className="text-[#191919]">Телефон:</span>
                <p className="font-medium text-[#191919]">
                  {formatPhone(car.current_renter_details.phone_number)}
                </p>
              </div>
            </div>
          </div>
        )}

        <Button variant="secondary" onClick={onClose} className="w-full">
          Вернуться к карте
        </Button>
      </div>
    </PushScreen>
  );
};
