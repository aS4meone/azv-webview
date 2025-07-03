import React, { useState } from "react";
import { createPortal } from "react-dom";
import { CameraIcon, GoodIcon, BadIcon } from "@/shared/icons";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";
import { Button } from "@/shared/ui";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import Loader from "@/shared/ui/loader";
import { FlutterCamera } from "@/shared/utils/flutter-camera";

export interface PhotoConfig {
  id: string;
  title: string;
  isSelfy?: boolean;
  cameraType?: "front" | "back";
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
  isCloseable?: boolean;
}

export const UploadPhoto: React.FC<UploadPhotoProps> = ({
  config,
  onPhotoUpload,
  isOpen = false,
  onClose,
  isLoading = false,
}) => {
  const { showModal } = useResponseModal();
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );
  const [loadingStates, setLoadingStates] = useState<{
    [key: string]: boolean;
  }>({});

  const setPhotoLoading = (photoId: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [photoId]: loading }));
  };

  const handleFlutterPhotoSelect = async (
    photoId: string,
    photoConfig: PhotoConfig
  ) => {
    try {
      setPhotoLoading(photoId, true);

      // Очищаем старые фотографии сразу при входе в камеру
      setSelectedFiles((prev) => ({
        ...prev,
        [photoId]: [],
      }));

      let files: File[] = [];

      let cameraType: "front" | "back" =
        photoConfig.cameraType || (photoConfig.isSelfy ? "front" : "back");

      console.log(`🔍 Отладка для ${photoId}:`, {
        "photoConfig.cameraType": photoConfig.cameraType,
        "photoConfig.isSelfy": photoConfig.isSelfy,
        "итоговый cameraType": cameraType,
        photoConfig: photoConfig,
      });

      if (cameraType !== "front" && cameraType !== "back") {
        console.warn(
          `⚠️ Некорректный cameraType: ${cameraType}, используем 'back'`
        );
        cameraType = "back";
      }

      console.log(`📱 Финальный cameraType для съемки: ${cameraType}`);

      if (photoConfig.multiple) {
        console.log(
          `📷 Множественные фото с камеры: ${photoConfig.multiple.min}-${photoConfig.multiple.max}, камера: ${cameraType}`
        );

        const base64Images = await FlutterCamera.captureMultiplePhotos(
          photoConfig.multiple.min,
          photoConfig.multiple.max,
          cameraType
        );

        if (base64Images.length < photoConfig.multiple.min) {
          showModal({
            type: "error",
            title: "Ошибка",
            description: `Минимальное количество фото: ${photoConfig.multiple.min}`,
            buttonText: "Понятно",
          });
          return;
        }

        files = FlutterCamera.base64ArrayToFiles(base64Images, photoId);
      } else {
        console.log(
          `📸 ${
            photoConfig.isSelfy ? "Селфи" : "Фото"
          } с камеры ${cameraType} для ${photoId}`
        );

        const base64Image = await FlutterCamera.capturePhoto(cameraType);
        if (base64Image) {
          const fileName = photoConfig.isSelfy
            ? `${photoId}_selfie.jpg`
            : `${photoId}.jpg`;
          files = [FlutterCamera.base64ToFile(base64Image, fileName)];
        }
      }

      if (files.length === 0) {
        showModal({
          type: "error",
          title: "Ошибка",
          description: "Не удалось сделать фотографии",
          buttonText: "Понятно",
        });
        return;
      }

      console.log(`✅ Успешно сделано ${files.length} фото для ${photoId}`);
      setSelectedFiles((prev) => ({
        ...prev,
        [photoId]: files,
      }));
    } catch (error) {
      console.error("Flutter camera error:", error);

      // При ошибке или отмене оставляем фотографии очищенными
      // (они уже были очищены в начале функции)

      showModal({
        type: "error",
        title: "Ошибка",
        description:
          error instanceof Error ? error.message : "Ошибка работы с камерой",
        buttonText: "Понятно",
      });
    } finally {
      setPhotoLoading(photoId, false);
    }
  };

  const flipImageHorizontally = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      if (!ctx) {
        console.error("Canvas context не поддерживается");
        resolve(file);
        return;
      }

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;

          // Отражаем изображение горизонтально
          ctx.scale(-1, 1);
          ctx.drawImage(img, -img.width, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const flippedFile = new File([blob], file.name, {
                  type: file.type,
                });
                console.log("✅ Изображение успешно отражено горизонтально");
                resolve(flippedFile);
              } else {
                console.error("Не удалось создать blob из canvas");
                resolve(file);
              }
            },
            file.type,
            0.9
          );
        } catch (error) {
          console.error("Ошибка при обработке изображения:", error);
          resolve(file);
        }
      };

      img.onerror = () => {
        console.error("Ошибка загрузки изображения");
        resolve(file);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoSelect = async (
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

    const maxSize = 10 * 1024 * 1024;
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

    // Исправляем реверс для селфи камеры
    let processedFiles = files;
    if (photoConfig?.isSelfy) {
      console.log(`🔄 Обнаружено селфи для ${photoId}, применяем flip`);
      try {
        setPhotoLoading(photoId, true);
        processedFiles = await Promise.all(
          files.map((file, index) => {
            console.log(
              `Обрабатываем файл ${index + 1}/${files.length}: ${file.name}`
            );
            return flipImageHorizontally(file);
          })
        );
        console.log(
          `✅ Успешно обработано ${processedFiles.length} файлов для селфи ${photoId}`
        );
      } catch (error) {
        console.error("❌ Ошибка обработки изображения:", error);
        // Используем исходные файлы в случае ошибки
      } finally {
        setPhotoLoading(photoId, false);
      }
    } else {
      console.log(`📷 Обычное фото для ${photoId}, flip не применяется`);
    }

    setSelectedFiles((prev) => ({
      ...prev,
      [photoId]: processedFiles,
    }));
  };

  const handleSubmit = () => {
    onPhotoUpload(selectedFiles);
  };

  const allPhotosUploaded = config.every(
    (photo) => selectedFiles[photo.id]?.length > 0
  );

  const isFlutterAvailable = FlutterCamera.isAvailable();

  const content = (
    <div className="flex flex-col gap-20 pb-[100px] pt-12 h-full">
      <div className="pt-24"></div>

      <div className="flex flex-col gap-8 ">
        {config.map((photo) => (
          <div key={photo.id} className="flex flex-col gap-2">
            <div className="flex items-start gap-2">
              <div>
                {selectedFiles[photo.id]?.length > 0 ? (
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

            {isFlutterAvailable ? (
              // Flutter камера доступна - используем везде
              <button
                onClick={() => handleFlutterPhotoSelect(photo.id, photo)}
                disabled={loadingStates[photo.id] || isLoading}
                className="block w-full"
              >
                <div className="w-full h-[56px] flex items-center justify-center bg-[#F5F5F5] rounded-[20px]">
                  <div className="flex items-center gap-2">
                    {loadingStates[photo.id] ? (
                      <Loader color="#191919" />
                    ) : (
                      <CameraIcon
                        className="w-5 h-5"
                        width={24}
                        height={24}
                        color="#191919"
                      />
                    )}
                    <span className="text-[17px] leading-[22px] font-normal text-[#191919]">
                      {loadingStates[photo.id]
                        ? "Обработка..."
                        : selectedFiles[photo.id]?.length > 0
                        ? `${selectedFiles[photo.id].length} фото готово`
                        : photo.multiple
                        ? "Сделать фото"
                        : photo.isSelfy
                        ? "Сделать селфи"
                        : "Сделать фото"}
                    </span>
                  </div>
                </div>
              </button>
            ) : (
              // Fallback на HTML input (только если Flutter недоступен)
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
                      {selectedFiles[photo.id]
                        ? `${selectedFiles[photo.id].length} фото сделано`
                        : photo.multiple
                        ? "Сделать фото"
                        : photo.isSelfy
                        ? "Сделать селфи"
                        : "Сделать фото"}
                    </span>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple={!!photo.multiple}
                  className="hidden"
                  onChange={(e) => handlePhotoSelect(photo.id, e)}
                  capture={
                    photo.cameraType === "front"
                      ? "user"
                      : photo.cameraType === "back"
                      ? "environment"
                      : photo.isSelfy
                      ? "user"
                      : undefined
                  }
                />
              </label>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <CustomPushScreen
      isOpen={true}
      onClose={onClose || (() => {})}
      direction="bottom"
      withHeader={true}
      isCloseable={false}
    >
      <div className="flex flex-col bg-white h-full">
        {content}
        {allPhotosUploaded && (
          <div className="sticky bottom-0  pt-4 pb-8">
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
    </CustomPushScreen>
  );

  // Рендерим через Portal в корень DOM
  return typeof window !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};
