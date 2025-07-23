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

// Компонент индикатора прогресса
const ProgressIndicator: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className="flex items-center gap-3 min-w-[140px]">
      <div className="relative w-14 h-14 drop-shadow-lg">
        {/* Фоновый круг */}
        <svg className="w-14 h-14 transform -rotate-90" viewBox="0 0 56 56">
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="#E5E7EB"
            strokeWidth="4"
            fill="none"
          />
          {/* Прогрессный круг */}
          <circle
            cx="28"
            cy="28"
            r="24"
            stroke="url(#gradient)"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - progress / 100)}`}
            style={{
              transition: "stroke-dashoffset 0.5s ease-out",
            }}
          />
          {/* Градиент для прогресса */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        {/* Процент в центре */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-[#059669] drop-shadow-sm">
            {progress}%
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-[16px] font-semibold text-[#059669]">
          Обработка фото
        </span>
        <span className="text-[13px] text-[#6B7280]">
          {progress === 100 ? "Завершение..." : "Пожалуйста, ждите"}
        </span>
      </div>
    </div>
  );
};

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
  const [progressStates, setProgressStates] = useState<{
    [key: string]: number;
  }>({});

  const setPhotoLoading = (photoId: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [photoId]: loading }));
    if (!loading) {
      setProgressStates((prev) => ({ ...prev, [photoId]: 0 }));
    }
  };

  const setPhotoProgress = (photoId: string, progress: number) => {
    setProgressStates((prev) => ({ ...prev, [photoId]: progress }));
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
        "photoConfig.multiple": photoConfig.multiple,
        "итоговый cameraType": cameraType,
        "полная конфигурация": photoConfig,
      });

      if (cameraType !== "front" && cameraType !== "back") {
        console.warn(
          `⚠️ Некорректный cameraType: ${cameraType}, используем 'back'`
        );
        cameraType = "back";
      }

      console.log(`📱 Финальный cameraType для съемки: ${cameraType}`);

      // Всегда используем кастомный экран камеры для множественных фото
      if (photoConfig.multiple) {
        console.log(
          `📷 Множественные фото с камеры: ${photoConfig.multiple.min}-${photoConfig.multiple.max}, камера: ${cameraType}`
        );

        const base64Images = await FlutterCamera.captureMultiplePhotos(
          photoConfig.multiple.min,
          photoConfig.multiple.max,
          cameraType
        );

        console.log(
          `✅ Получено ${base64Images.length} фото от React Native камеры`
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

        // Показываем прогресс обработки
        setPhotoProgress(photoId, 50);
        files = FlutterCamera.base64ArrayToFiles(base64Images, photoId);
        setPhotoProgress(photoId, 100);
      } else {
        console.log(
          `📸 ${
            photoConfig.isSelfy ? "Селфи" : "Фото"
          } с камеры ${cameraType} для ${photoId} - используем обычную камеру`
        );

        const base64Image = await FlutterCamera.capturePhoto(cameraType);
        if (base64Image) {
          setPhotoProgress(photoId, 50);
          const fileName = photoConfig.isSelfy
            ? `${photoId}_selfie.jpg`
            : `${photoId}.jpg`;
          files = [FlutterCamera.base64ToFile(base64Image, fileName)];
          setPhotoProgress(photoId, 100);
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

      // Показываем 100% прогресс
      setPhotoProgress(photoId, 100);
    } catch (error) {
      console.error("React Native camera error:", error);

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
      // Для быстрой обработки - пропускаем flip для селфи, так как камера уже делает это
      console.log("🚀 Быстрая обработка селфи - пропускаем flip");
      resolve(file);
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

    // Быстрая обработка файлов с индикатором загрузки
    let processedFiles = files;
    if (photoConfig?.isSelfy) {
      console.log(`🚀 Быстрая обработка селфи для ${photoId}`);
      setPhotoLoading(photoId, true);
      // Пропускаем обработку - используем файлы как есть
      setPhotoProgress(photoId, 100);
      setPhotoLoading(photoId, false);
    } else {
      console.log(`📷 Обычное фото для ${photoId}, обработка не требуется`);
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

  // Добавляем отладочную информацию
  console.log("🔍 React Native Camera Debug Info:", {
    isFlutterAvailable,
    hasReactNativeWebView: !!(
      typeof window !== "undefined" && window.ReactNativeWebView
    ),
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
    windowObject:
      typeof window !== "undefined"
        ? Object.keys(window).filter((k) => k.includes("ReactNative"))
        : [],
  });

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
              // React Native камера доступна - используем везде
              <button
                onClick={() => handleFlutterPhotoSelect(photo.id, photo)}
                disabled={loadingStates[photo.id] || isLoading}
                className="block w-full"
              >
                <div
                  className={`w-full h-[56px] flex items-center justify-center rounded-[20px] ${
                    loadingStates[photo.id] && progressStates[photo.id] > 0
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
                      : "bg-[#F5F5F5]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {loadingStates[photo.id] ? (
                      progressStates[photo.id] > 0 ? (
                        <ProgressIndicator
                          progress={progressStates[photo.id]}
                        />
                      ) : (
                        <Loader color="#191919" />
                      )
                    ) : (
                      <>
                        <CameraIcon
                          className="w-5 h-5"
                          width={24}
                          height={24}
                          color="#191919"
                        />
                        <span className="text-[17px] leading-[22px] font-normal text-[#191919]">
                          {selectedFiles[photo.id]?.length > 0
                            ? `${selectedFiles[photo.id].length} фото готово`
                            : photo.multiple
                            ? "Сделать фото"
                            : photo.isSelfy
                            ? "Сделать селфи"
                            : "Сделать фото"}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            ) : (
              // Fallback на HTML input (только если React Native недоступен)
              <label className="block w-full">
                <div
                  className={`w-full h-[56px] flex items-center justify-center rounded-[20px] ${
                    loadingStates[photo.id] && progressStates[photo.id] > 0
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
                      : "bg-[#F5F5F5]"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {loadingStates[photo.id] ? (
                      progressStates[photo.id] > 0 ? (
                        <ProgressIndicator
                          progress={progressStates[photo.id]}
                        />
                      ) : (
                        <Loader color="#191919" />
                      )
                    ) : (
                      <>
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
                      </>
                    )}
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
      withCloseButton={false}
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
