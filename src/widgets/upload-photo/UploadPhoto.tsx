import React, { useState } from "react";
import { CameraIcon, GoodIcon, BadIcon, ArrowLeftIcon } from "@/shared/icons";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";
import { Button } from "@/shared/ui";
import PushScreen from "@/shared/ui/push-screen";
import Loader from "@/shared/ui/loader";

export interface PhotoConfig {
  id: string;
  title: string;
  isSelfy?: boolean;
  multiple?: {
    min: number;
    max: number;
  };
}

interface UploadPhotoProps {
  config: PhotoConfig[];
  onPhotoUpload: (files: { [key: string]: File[] }) => void;
  isOpen?: boolean;
  onClose?: () => void;
  withCloseButton?: boolean;
  isLoading?: boolean;
}

export const UploadPhoto: React.FC<UploadPhotoProps> = ({
  config,
  onPhotoUpload,
  isOpen = false,
  onClose,
  withCloseButton = false,
  isLoading = false,
}) => {
  const { showModal } = useResponseModal();
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );

  const handlePhotoSelect = (
    photoId: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    const photoConfig = config.find((c) => c.id === photoId);

    if (photoConfig?.multiple) {
      if (files.length < photoConfig.multiple.min) {
        showModal({
          type: "error",
          title: "Ошибка",
          description: `Минимальное количество фото: ${photoConfig.multiple.min}`,
          buttonText: "Понятно",
        });
        return;
      }
      if (files.length > photoConfig.multiple.max) {
        showModal({
          type: "error",
          title: "Ошибка",
          description: `Максимальное количество фото: ${photoConfig.multiple.max}`,
          buttonText: "Понятно",
        });
        return;
      }
    } else if (files.length > 1) {
      showModal({
        type: "error",
        title: "Ошибка",
        description: "Можно загрузить только одно фото",
        buttonText: "Понятно",
      });
      return;
    }

    // Проверка размера файлов (например, максимум 10MB на файл)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      showModal({
        type: "error",
        title: "Ошибка",
        description: "Размер каждого файла не должен превышать 10MB",
        buttonText: "Понятно",
      });
      return;
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [photoId]: files,
    }));
  };

  const handleSubmit = () => {
    onPhotoUpload(selectedFiles);
  };

  const allPhotosUploaded = config.every(
    (photo) => selectedFiles[photo.id]?.length > 0
  );

  const content = (
    <div className="flex flex-col gap-8 pb-[100px]">
      {config.map((photo) => (
        <div key={photo.id} className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <div>
              {selectedFiles[photo.id] ? (
                <GoodIcon className="w-6 h-6" width={32} height={32} />
              ) : (
                <BadIcon className="w-6 h-6" width={32} height={32} />
              )}
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-[17px] leading-[22px] font-normal text-[#000000]">
                {photo.title}
              </h3>
              {photo.multiple && (
                <p className="text-[17px] leading-[22px] font-normal text-[#000000]">
                  Минимум {photo.multiple.min}, максимум {photo.multiple.max}.
                </p>
              )}
            </div>
          </div>

          <label className="block w-full">
            <div className="w-full h-[56px] flex items-center justify-center bg-[#F5F5F5] rounded-[20px]">
              <div className="flex items-center gap-2">
                <CameraIcon
                  className="w-5 h-5"
                  width={24}
                  height={24}
                  color="#191919"
                />
                <span className="text-[17px] leading-[22px] font-normal text-[#191919]">
                  {selectedFiles[photo.id] ? "Фото загружено" : "Сделать фото"}
                </span>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple={!!photo.multiple}
              className="hidden"
              onChange={(e) => handlePhotoSelect(photo.id, e)}
              {...(photo.isSelfy ? { capture: "user" } : {})}
            />
          </label>
        </div>
      ))}
    </div>
  );

  if (!isOpen) {
    return null;
  }

  return (
    <PushScreen onClose={onClose}>
      {withCloseButton && (
        <div className="absolute top-10 left-4">
          <button onClick={onClose} className="text-[#007AFF]">
            <ArrowLeftIcon className="w-7 h-7" />
          </button>
        </div>
      )}
      <div className="pt-4">
        {content}
        {allPhotosUploaded && (
          <div className="fixed bottom-12 left-8 right-8  ">
            <Button
              variant="secondary"
              onClick={handleSubmit}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? <Loader color="#fff" /> : "Отправить"}
            </Button>
          </div>
        )}
      </div>
    </PushScreen>
  );
};
