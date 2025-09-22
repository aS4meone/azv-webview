"use client";

import React, { useState } from "react";
import { CameraIcon, GoodIcon, BadIcon } from "@/shared/icons";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";
import { Button } from "@/shared/ui";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import Loader from "@/shared/ui/loader";
import { FlutterCamera } from "@/shared/utils/flutter-camera";
import { StencilConfig } from "@/shared/models/types/stencil";
import { StencilOverlay } from "@/widgets/upload-photo/StencilOverlay";
import { useTranslations } from "next-intl";

export interface PhotoConfig {
  id: string;
  title: string;
  isSelfy?: boolean;
  cameraType?: "front" | "back";
  multiple?: { min: number; max: number };
  stencil?: StencilConfig;
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
const ProgressIndicator: React.FC<{ progress: number; t: (key: string) => string }> = ({ progress, t }) => {
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
          {t("processingPhoto")}
        </span>
        <span className="text-[13px] text-[#6B7280]">
          {progress === 100 ? t("completing") : t("pleaseWait")}
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
  const t = useTranslations("uploadPhoto");
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
  const [activeStencil, setActiveStencil] = useState<StencilConfig | undefined>();


  const setPhotoLoading = (photoId: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [photoId]: loading }));
    if (!loading) {
      setProgressStates((prev) => ({ ...prev, [photoId]: 0 }));
    }
  };

  const setPhotoProgress = (photoId: string, progress: number) => {
    setProgressStates((prev) => ({ ...prev, [photoId]: progress }));
  };

  const wrappedOnClose = () => {
    onClose?.();
  };

  const handleFlutterPhotoSelect = async (photoId: string, photoConfig: PhotoConfig) => {
    try {
      setActiveStencil(photoConfig.stencil);  // показать трафарет
      setPhotoLoading(photoId, true);
      setSelectedFiles((prev) => ({ ...prev, [photoId]: [] }));

      let files: File[] = [];
      let cameraType: "front" | "back" =
        photoConfig.cameraType || (photoConfig.isSelfy ? "front" : "back");

      if (photoConfig.multiple) {
        // ПЕРЕДАЁМ трафарет 4-м параметром (если нативная камера его поддержит)
        const base64Images = await FlutterCamera.captureMultiplePhotos(
          photoConfig.multiple.min,
          photoConfig.multiple.max,
          cameraType
        );
        setPhotoProgress(photoId, 50);
        files = FlutterCamera.base64ArrayToFiles(base64Images, photoId);
        setPhotoProgress(photoId, 100);
      } else {
        const base64Image = await FlutterCamera.capturePhoto(
          cameraType
        );
        if (base64Image) {
          setPhotoProgress(photoId, 50);
          const fileName = photoConfig.isSelfy ? `${photoId}_selfie.jpg` : `${photoId}.jpg`;
          files = [FlutterCamera.base64ToFile(base64Image, fileName)];
          setPhotoProgress(photoId, 100);
        }
      }

      if (files.length === 0) {
        showModal({ type: "error", title: t("error"), description: t("failedToTakePhotos"), buttonText: t("understood") });
        return;
      }

      setSelectedFiles((prev) => ({ ...prev, [photoId]: files }));
    } catch (e) {
      console.error(e);
      showModal({ type: "error", title: t("error"), description: t("cameraError"), buttonText: t("understood") });
    } finally {
      setPhotoLoading(photoId, false);
      // скрыть трафарет через небольшой таймаут, чтобы пользователь увидел 100%
      setTimeout(() => setActiveStencil(undefined), 120);
    }
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
          title: t("error"),
          description: `${t("minPhotosRequired")} ${photoConfig.multiple.min}`,
          buttonText: t("understood"),
        });
        return;
      }
      if (files.length > photoConfig.multiple.max) {
        showModal({
          type: "error",
          title: t("error"),
          description: `${t("maxPhotosExceeded")} ${photoConfig.multiple.max}`,
          buttonText: t("understood"),
        });
        return;
      }
    } else if (files.length > 1) {
      showModal({
        type: "error",
        title: t("error"),
        description: t("onlyOnePhotoAllowed"),
        buttonText: t("understood"),
      });
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      showModal({
        type: "error",
        title: t("error"),
        description: t("fileSizeExceeded"),
        buttonText: t("understood"),
      });
      return;
    }

    // Быстрая обработка файлов с индикатором загрузки
    const processedFiles = files;
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
    <div className="bg-white min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            
            <div>
              <h2 className="text-xl font-bold text-[#191919]">{t("uploadDocuments")}</h2>
              <p className="text-sm text-[#666666] mt-1">{t("takeRequiredDocuments")}</p>
            </div>
          </div>
          <Button onClick={wrappedOnClose} variant="icon" className="shadow-sm">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="black"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Photo upload sections */}
      <div className="py-6 space-y-4">
        {config.map((photo, index) => (
          <div key={photo.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
            <div className="space-y-4">
              {/* Title */}
              <div>
                <h3 className="text-base font-semibold text-[#191919] mb-1">
                  {photo.title}
                </h3>
                {photo.multiple && (
                  <p className="text-sm text-[#666666]">
                    {t("minMaxPhotos", { min: photo.multiple.min, max: photo.multiple.max })}
                  </p>
                )}
              </div>

              {/* Upload button */}
              {isFlutterAvailable ? (
                <button
                  onClick={() => handleFlutterPhotoSelect(photo.id, photo)}
                  disabled={loadingStates[photo.id] || isLoading}
                  className="block w-full group"
                >
                  <div
                    className={`w-full h-16 flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                      loadingStates[photo.id] && progressStates[photo.id] > 0
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                        : selectedFiles[photo.id]?.length > 0
                          ? "bg-green-50 border-green-200 group-hover:bg-green-100"
                          : "bg-gray-50 border-gray-200 group-hover:bg-gray-100 group-hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {loadingStates[photo.id] ? (
                        progressStates[photo.id] > 0 ? (
                          <ProgressIndicator
                            progress={progressStates[photo.id]}
                            t={t}
                          />
                        ) : (
                          <Loader color="#191919" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-[#191919]">
                          {selectedFiles[photo.id]?.length > 0
                            ? t("photosReady", { count: selectedFiles[photo.id].length })
                            : photo.multiple
                              ? t("takePhoto")
                              : photo.isSelfy
                                ? t("takeSelfie")
                                : t("takePhoto")}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ) : (
                <label className="block w-full group">
                  <div
                    className={`w-full h-16 flex items-center justify-center rounded-xl border-2 transition-all duration-200 ${
                      loadingStates[photo.id] && progressStates[photo.id] > 0
                        ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                        : selectedFiles[photo.id]?.length > 0
                          ? "bg-green-50 border-green-200 group-hover:bg-green-100"
                          : "bg-gray-50 border-gray-200 group-hover:bg-gray-100 group-hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {loadingStates[photo.id] ? (
                        progressStates[photo.id] > 0 ? (
                          <ProgressIndicator
                            progress={progressStates[photo.id]}
                            t={t}
                          />
                        ) : (
                          <Loader color="#191919" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-[#191919]">
                          {selectedFiles[photo.id]
                            ? t("photosTaken", { count: selectedFiles[photo.id].length })
                            : photo.multiple
                              ? t("takePhoto")
                              : photo.isSelfy
                                ? t("takeSelfie")
                                : t("takePhoto")}
                        </span>
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
          </div>
        ))}
      </div>

      {/* Bottom submit button */}
      {allPhotosUploaded && (
        <div className="bg-white pt-4 pb-6 px-6 mb-10">
          <Button
            variant="secondary"
            onClick={handleSubmit}
            className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isLoading}
          >
            {isLoading ? <Loader color="#fff" /> : t("submit")}
          </Button>
        </div>
      )}
    </div>
  );

  if (!isOpen) {
    return null;
  }

  const modalContent = (
    <CustomPushScreen
      isOpen={true}
      onClose={onClose || (() => { })}
      direction="bottom"
      withHeader={true}
      withCloseButton={false}
      isCloseable={false}
    >
      <div className="flex flex-col bg-white h-full">
        {content}
      </div>
      <StencilOverlay stencil={activeStencil} visible={!!activeStencil} />
    </CustomPushScreen>
  );

  // Рендерим напрямую, без Portal, чтобы сохранить контекст NextIntlClientProvider
  return modalContent;
};
