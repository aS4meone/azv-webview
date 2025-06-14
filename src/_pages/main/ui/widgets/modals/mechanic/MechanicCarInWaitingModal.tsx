import { Button } from "@/shared/ui";
import React, { useState, useEffect } from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { useResponseModal } from "@/shared/ui/modal";
import { IUser } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { UploadPhoto } from "@/widgets/upload-photo/UploadPhoto";
import { baseConfig } from "@/shared/contexts/PhotoUploadContext";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { MechanicWaitingTimer } from "../../components/MechanicTimer";

interface MechanicCarInWaitingModalProps {
  user: IUser;
  onClose: () => void;
}

interface DeliveryData {
  rental_id: number;
  car_id: number;
  car_name: string;
  plate_number: string;
  fuel_level: number;
  latitude: number;
  longitude: number;
  course: number;
  engine_volume: number;
  drive_type: number;
  photos: string[];
  year: number;
  delivery_coordinates: {
    latitude: number;
    longitude: number;
  };
  reservation_time: string;
  status: string;
}

export const MechanicCarInWaitingModal = ({
  user,
  onClose,
}: MechanicCarInWaitingModalProps) => {
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const [isDeliveryMode, setIsDeliveryMode] = useState(false);
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const car = user.current_rental!.car_details;

  // Проверяем, есть ли текущая доставка
  useEffect(() => {
    const checkCurrentDelivery = async () => {
      try {
        const response = await mechanicApi.getCurrentDelivery();
        if (response.status === 200 && response.data) {
          setIsDeliveryMode(true);
          setDeliveryData(response.data);
          console.log("Current delivery:", response.data);
        } else {
          setIsDeliveryMode(false);
          setDeliveryData(null);
        }
      } catch (error) {
        console.log(error);
        setIsDeliveryMode(false);
        setDeliveryData(null);
      }
    };

    checkCurrentDelivery();
  }, []);

  async function handleStartInspection() {
    try {
      const res = await mechanicApi.startCheckCar();
      if (res.status === 200) {
        showModal({
          type: "success",
          title: "Осмотр успешно начат",
          description: "Загрузите фотографии автомобиля перед началом осмотра",
          buttonText: "Отлично",
          onClose: async () => {
            await refreshUser();
            setShowUploadPhoto(true);
          },
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        description: error.response.data.detail,
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  }

  async function handleStartDelivery() {
    try {
      // Для доставки используем тот же API что и для осмотра
      const res = await mechanicApi.startCheckCar();
      if (res.status === 200) {
        showModal({
          type: "success",
          title: "Доставка успешно начата",
          description: "Загрузите фотографии автомобиля перед началом доставки",
          buttonText: "Отлично",
          onClose: async () => {
            await refreshUser();
            setShowUploadPhoto(true);
          },
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        description: error.response.data.detail,
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  }

  const handleCancelInspection = async () => {
    onClose();
    try {
      const res = await mechanicApi.cancelCheckCar();
      if (res.status === 200) {
        showModal({
          type: "success",
          description: isDeliveryMode
            ? "Доставка успешно отменена"
            : "Осмотр успешно отменен",
          buttonText: "Отлично",
          onClose: async () => {
            await refreshUser();
          },
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        description: error.response.data.detail,
        buttonText: "Попробовать снова",
        onClose: () => {},
      });
    }
  };

  const handleUploadBeforeInspection = async (files: {
    [key: string]: File[];
  }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    const res = await mechanicApi.uploadBeforeCheckCar(formData);
    if (res.status === 200) {
      setIsLoading(false);
      setShowUploadPhoto(false);
      showModal({
        type: "success",
        description: "Фотографии успешно загружены, можно начинать осмотр",
        buttonText: "Отлично",
        onClose: async () => {
          onClose();
          await refreshUser();
        },
      });
    }
  };

  const handleUploadBeforeDelivery = async (files: {
    [key: string]: File[];
  }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    const res = await mechanicApi.uploadBeforeDelivery(formData);
    if (res.status === 200) {
      setIsLoading(false);
      setShowUploadPhoto(false);
      showModal({
        type: "success",
        description: "Фотографии перед доставкой успешно загружены",
        buttonText: "Отлично",
        onClose: async () => {
          onClose();
          await refreshUser();
        },
      });
    }
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      <UploadPhoto
        config={baseConfig}
        onPhotoUpload={
          isDeliveryMode
            ? handleUploadBeforeDelivery
            : handleUploadBeforeInspection
        }
        isLoading={isLoading}
        isOpen={showUploadPhoto}
        onClose={() => setShowUploadPhoto(false)}
      />

      {/* Таймер ожидания */}
      <div className="absolute -top-16 right-4 left-4 z-10">
        <MechanicWaitingTimer user={user} />
      </div>

      {/* Car Image Carousel */}
      <CarImageCarousel
        car={car}
        height="h-64"
        showProgressIndicator
        rounded={true}
      />

      {/* Content */}
      <div className="p-6 pt-4 space-y-6">
        {/* Car Title and Plate */}
        <CarInfoHeader car={car} />

        {/* Car Specs */}
        <CarSpecs car={car} />

        {/* Delivery Info */}
        {isDeliveryMode && deliveryData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Адрес доставки:
            </h3>
            <p className="text-sm text-blue-700">
              Координаты:{" "}
              {deliveryData.delivery_coordinates.latitude.toFixed(6)},{" "}
              {deliveryData.delivery_coordinates.longitude.toFixed(6)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              Заказ от:{" "}
              {new Date(deliveryData.reservation_time).toLocaleString()}
            </p>
          </div>
        )}

        <div>
          <h4 className="text-[20px] font-semibold text-[#191919]">
            {isDeliveryMode ? "Подготовка к доставке" : "Подготовка к осмотру"}
          </h4>
          <h4 className="text-[18px] text-[#191919]">
            {isDeliveryMode
              ? "Сфотографируйте автомобиль перед доставкой, зафиксировав текущее состояние."
              : "Сфотографируйте автомобиль перед началом осмотра, зафиксировав все повреждения, дефекты и состояние салона."}
          </h4>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="outline" onClick={handleCancelInspection}>
            {isDeliveryMode ? "Отменить доставку" : "Отменить осмотр"}
          </Button>
          <Button
            onClick={
              isDeliveryMode ? handleStartDelivery : handleStartInspection
            }
            variant="secondary"
          >
            {isDeliveryMode ? "Начать доставку" : "Начать осмотр"}
          </Button>
        </div>
      </div>
    </div>
  );
};
