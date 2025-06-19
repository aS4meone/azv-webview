import { Button } from "@/shared/ui";
import React, { useState } from "react";
import { CarImageCarousel, CarInfoHeader, CarSpecs } from "../ui";
import { useResponseModal } from "@/shared/ui/modal";
import { IUser } from "@/shared/models/types/user";
import { useUserStore } from "@/shared/stores/userStore";
import { UploadPhoto } from "@/widgets/upload-photo/UploadPhoto";
import {
  baseConfig,
  SERVICE_UPLOAD,
  usePhotoUpload,
} from "@/shared/contexts/PhotoUploadContext";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { MechanicWaitingTimer } from "../../timers/MechanicTimer";
import { CarStatus } from "@/shared/models/types/car";
import { DescriptionScreen } from "../../screens/description-screen/DescriptionScreen";

interface MechanicCarInWaitingModalProps {
  user: IUser;
  onClose: () => void;
}

export const MechanicCarInWaitingModal = ({
  user,
  onClose,
}: MechanicCarInWaitingModalProps) => {
  const [showUploadPhoto, setShowUploadPhoto] = useState(false);
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const { setUploadRequired } = usePhotoUpload();
  const [showDataScreen, setShowDataScreen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const car = user.current_rental!.car_details;

  async function handleStartInspection() {
    try {
      const res = await mechanicApi.startCheckCar();
      if (res.status === 200) {
        setUploadRequired(SERVICE_UPLOAD, true);
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

  const handleCancelInspection = async () => {
    onClose();
    try {
      const res = await mechanicApi.cancelCheckCar();
      if (res.status === 200) {
        showModal({
          type: "success",
          description: "Осмотр успешно отменен",
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

  const handleViewData = () => {
    setShowDataScreen(true);
  };

  return (
    <div className="bg-white rounded-t-[24px] w-full mb-0 relative">
      <UploadPhoto
        config={baseConfig}
        onPhotoUpload={handleUploadBeforeInspection}
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

        <div>
          <h4 className="text-[20px] font-semibold text-[#191919]">
            Подготовка к осмотру
          </h4>
          <h4 className="text-[18px] text-[#191919]">
            Сфотографируйте автомобиль перед началом осмотра, зафиксировав все
            повреждения, дефекты и состояние салона.
          </h4>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {car.status === CarStatus.service && (
            <Button variant="outline" onClick={handleViewData}>
              Посмотреть данные
            </Button>
          )}

          <Button variant="outline" onClick={handleCancelInspection}>
            Отменить осмотр
          </Button>
          <Button onClick={handleStartInspection} variant="secondary">
            Начать осмотр
          </Button>
        </div>
      </div>

      {showDataScreen && (
        <DescriptionScreen car={car} onClose={() => setShowDataScreen(false)} />
      )}
    </div>
  );
};
