"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { PhotoConfig } from "@/widgets/upload-photo/UploadPhoto";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import { rentApi } from "@/shared/api/routes/rent";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";
import { useRouter } from "next/navigation";
import { useUserStore } from "../stores/userStore";
import { useModal } from "../ui/modal";

export const USER_UPLOAD = "user-upload";
export const OWNER_UPLOAD = "owner-upload";
export const SERVICE_UPLOAD = "service-upload";
export const DELIVERY_UPLOAD = "delivery-upload";

interface PhotoUploadContextType {
  isUserUploadRequired: boolean;
  isOwnerUploadRequired: boolean;
  isServiceUploadRequired: boolean;
  isDeliveryUploadRequired: boolean;
  setUploadCompleted: (uploadType: string) => void;
  setUploadRequired: (uploadType: string, required: boolean) => void;
  showUserUploadModal: () => void;
  showOwnerUploadModal: () => void;
  showServiceUploadModal: () => void;
  showDeliveryUploadModal: () => void;
  isInitialized: boolean;
}

const PhotoUploadMgrContext = createContext<PhotoUploadContextType | undefined>(
  undefined
);

interface PhotoUploadProviderProps {
  children: ReactNode;
}

export const PhotoUploadProvider = ({
  children,
}: PhotoUploadProviderProps) => {
  const [isUserUploadRequired, setIsUserUploadRequired] = useState(false);
  const [isOwnerUploadRequired, setIsOwnerUploadRequired] = useState(false);
  const [isServiceUploadRequired, setIsServiceUploadRequired] = useState(false);
  const [isDeliveryUploadRequired, setIsDeliveryUploadRequired] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { hideModal } = useModal();
  const { showModal } = useResponseModal();
  const { refreshUser } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    const checkUploadRequirements = () => {
      const userUpload = localStorage.getItem(USER_UPLOAD);
      const ownerUpload = localStorage.getItem(OWNER_UPLOAD);
      const serviceUpload = localStorage.getItem(SERVICE_UPLOAD);
      const deliveryUpload = localStorage.getItem(DELIVERY_UPLOAD);

      // Если значение "true" - загрузка завершена (не требуется)
      // Если значение "false" или null - загрузка требуется
      // НО НЕ ПОКАЗЫВАЕМ модалки автоматически при первом запуске
      setIsUserUploadRequired(false); // Не показываем автоматически
      setIsOwnerUploadRequired(false); // Не показываем автоматически
      setIsServiceUploadRequired(false); // Не показываем автоматически
      setIsDeliveryUploadRequired(false); // Не показываем автоматически
      
      setIsInitialized(true);
    };

    checkUploadRequirements();
  }, []);

  const setUploadCompleted = (uploadType: string) => {
    localStorage.setItem(uploadType, "true");

    switch (uploadType) {
      case USER_UPLOAD:
        setIsUserUploadRequired(false);
        break;
      case OWNER_UPLOAD:
        setIsOwnerUploadRequired(false);
        break;
      case SERVICE_UPLOAD:
        setIsServiceUploadRequired(false);
        break;
      case DELIVERY_UPLOAD:
        setIsDeliveryUploadRequired(false);
        break;
      default:
        console.warn(`Unknown upload type: ${uploadType}`);
    }
  };

  const setUploadRequired = (uploadType: string, required: boolean) => {
    localStorage.setItem(uploadType, required ? "false" : "true");

    switch (uploadType) {
      case USER_UPLOAD:
        setIsUserUploadRequired(required);
        break;
      case OWNER_UPLOAD:
        setIsOwnerUploadRequired(required);
        break;
      case SERVICE_UPLOAD:
        setIsServiceUploadRequired(required);
        break;
      case DELIVERY_UPLOAD:
        setIsDeliveryUploadRequired(required);
        break;
      default:
        console.warn(`Unknown upload type: ${uploadType}`);
    }
  };

  // Методы для программного показа модалок
  const showUserUploadModal = () => {
    const userUpload = localStorage.getItem(USER_UPLOAD);
    if (userUpload !== "true") {
      setIsUserUploadRequired(true);
    }
  };

  const showOwnerUploadModal = () => {
    const ownerUpload = localStorage.getItem(OWNER_UPLOAD);
    if (ownerUpload !== "true") {
      setIsOwnerUploadRequired(true);
    }
  };

  const showServiceUploadModal = () => {
    const serviceUpload = localStorage.getItem(SERVICE_UPLOAD);
    if (serviceUpload !== "true") {
      setIsServiceUploadRequired(true);
    }
  };

  const showDeliveryUploadModal = () => {
    const deliveryUpload = localStorage.getItem(DELIVERY_UPLOAD);
    if (deliveryUpload !== "true") {
      setIsDeliveryUploadRequired(true);
    }
  };

  const handleUserPhotoUpload = async (files: { [key: string]: File[] }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    try {
      const res = await rentApi.uploadBeforeRent(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setUploadCompleted(USER_UPLOAD);
        showModal({
          type: "success",
          description: "Фотографии успешно загружены",
          buttonText: "Отлично",
          onClose: () => {
            router.refresh();
            refreshUser();
            hideModal();
          },
        });
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      showModal({
        type: "error",
        description: "Ошибка загрузки фотографий",
        buttonText: "Попробовать снова",
      });
    }
  };

  const handleOwnerPhotoUpload = async (files: { [key: string]: File[] }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    try {
      const res = await rentApi.uploadOwnerBeforeRent(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setUploadCompleted(OWNER_UPLOAD);
        showModal({
          type: "success",
          description: "Фотографии успешно загружены",
          buttonText: "Отлично",
          onClose: () => {
            router.refresh();
            refreshUser();
            hideModal();
          },
        });
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      showModal({
        type: "error",
        description: "Ошибка загрузки фотографий",
        buttonText: "Попробовать снова",
      });
    }
  };

  const handleServicePhotoUpload = async (files: { [key: string]: File[] }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    try {
      const res = await mechanicApi.uploadBeforeCheckCar(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setUploadCompleted(SERVICE_UPLOAD);
        showModal({
          type: "success",
          description: "Фотографии успешно загружены, можно начинать осмотр",
          buttonText: "Отлично",
          onClose: () => {
            router.refresh();
            refreshUser();
            hideModal();
          },
        });
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      showModal({
        type: "error",
        description: "Ошибка загрузки фотографий сервиса",
        buttonText: "Попробовать снова",
      });
    }
  };

  const handleDeliveryPhotoUpload = async (files: {
    [key: string]: File[];
  }) => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in files) {
      for (const file of files[key]) {
        formData.append(key, file);
      }
    }
    try {
      const res = await mechanicApi.uploadBeforeDelivery(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setUploadCompleted(DELIVERY_UPLOAD);
        showModal({
          type: "success",
          description: "Фотографии доставки успешно загружены",
          buttonText: "Отлично",
          onClose: () => {
            router.refresh();
            refreshUser();
            hideModal();
          },
        });
      }
    } catch (error) {
      console.log(error);
      setIsLoading(false);
      showModal({
        type: "error",
        description: "Ошибка загрузки фотографий доставки",
        buttonText: "Попробовать снова",
      });
    }
  };

  const contextValue: PhotoUploadContextType = {
    isUserUploadRequired,
    isOwnerUploadRequired,
    isServiceUploadRequired,
    isDeliveryUploadRequired,
    setUploadCompleted,
    setUploadRequired,
    showUserUploadModal,
    showOwnerUploadModal,
    showServiceUploadModal,
    showDeliveryUploadModal,
    isInitialized,
  };

  return (
    <PhotoUploadMgrContext.Provider value={contextValue}>
      {children}

      {/* User Upload Modal */}
      {isUserUploadRequired && (
        <UploadPhoto
          config={baseConfig}
          onPhotoUpload={handleUserPhotoUpload}
          isOpen={true}
          onClose={() => setUploadRequired(USER_UPLOAD, false)}
          isLoading={isLoading}
          isCloseable={false}
        />
      )}

      {/* Owner Upload Modal */}
      {isOwnerUploadRequired && (
        <UploadPhoto
          config={ownerConfig}
          onPhotoUpload={handleOwnerPhotoUpload}
          isOpen={true}
          onClose={() => setUploadRequired(OWNER_UPLOAD, false)}
          isLoading={isLoading}
          isCloseable={false}
        />
      )}

      {/* Service Upload Modal */}
      {isServiceUploadRequired && (
        <UploadPhoto
          config={baseConfig}
          onPhotoUpload={handleServicePhotoUpload}
          isOpen={true}
          onClose={() => setUploadRequired(SERVICE_UPLOAD, false)}
          isLoading={isLoading}
          isCloseable={false}
        />
      )}

      {/* Delivery Upload Modal */}
      {isDeliveryUploadRequired && (
        <UploadPhoto
          config={baseConfig}
          onPhotoUpload={handleDeliveryPhotoUpload}
          isOpen={true}
          onClose={() => setUploadRequired(DELIVERY_UPLOAD, false)}
          isLoading={isLoading}
          isCloseable={false}
        />
      )}
    </PhotoUploadMgrContext.Provider>
  );
};

export const usePhotoUpload = (): PhotoUploadContextType => {
  const context = useContext(PhotoUploadMgrContext);
  if (!context) {
    throw new Error("usePhotoUpload must be used within a PhotoUploadProvider");
  }
  return context;
};

// Legacy exports for backward compatibility
export const baseConfig: PhotoConfig[] = [
  {
    id: "selfie",
    title: "Сделайте селфи.",
    cameraType: "front",
    multiple: { min: 1, max: 1 },
  },
  {
    id: "car_photos",
    title: "Сделайте фото машины со всех сторон.",
    multiple: { min: 1, max: 1 },
    cameraType: "back",
  },
  {
    id: "interior_photos",
    title: "Сделайте фото салона.",
    multiple: { min: 1, max: 1 },
    cameraType: "back",
  },
];

export const ownerConfig: PhotoConfig[] = baseConfig.slice(1);
