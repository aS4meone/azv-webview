"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { UploadPhoto, PhotoConfig } from "@/widgets/upload-photo/UploadPhoto";
import { rentApi } from "@/shared/api/routes/rent";
import { mechanicApi } from "@/shared/api/routes/mechanic";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";
import { useRouter } from "next/navigation";

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
}

const PhotoUploadMgrContext = createContext<PhotoUploadContextType | undefined>(
  undefined
);

interface PhotoUploadProviderProps {
  children: ReactNode;
}

export const PhotoUploadProvider: React.FC<PhotoUploadProviderProps> = ({
  children,
}) => {
  const [isUserUploadRequired, setIsUserUploadRequired] = useState(false);
  const [isOwnerUploadRequired, setIsOwnerUploadRequired] = useState(false);
  const [isServiceUploadRequired, setIsServiceUploadRequired] = useState(false);
  const [isDeliveryUploadRequired, setIsDeliveryUploadRequired] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showModal } = useResponseModal();
  const router = useRouter();

  // Check localStorage on mount
  useEffect(() => {
    const checkUploadRequirements = () => {
      const userUpload = localStorage.getItem(USER_UPLOAD);
      const ownerUpload = localStorage.getItem(OWNER_UPLOAD);
      const serviceUpload = localStorage.getItem(SERVICE_UPLOAD);
      const deliveryUpload = localStorage.getItem(DELIVERY_UPLOAD);

      setIsUserUploadRequired(userUpload === "false");
      setIsOwnerUploadRequired(ownerUpload === "false");
      setIsServiceUploadRequired(serviceUpload === "false");
      setIsDeliveryUploadRequired(deliveryUpload === "false");
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
      // You can create a specific API endpoint for delivery uploads
      // For now using the same as user upload
      const res = await rentApi.uploadBeforeRent(formData);
      if (res.status === 200) {
        setIsLoading(false);
        setUploadCompleted(DELIVERY_UPLOAD);
        showModal({
          type: "success",
          description: "Фотографии доставки успешно загружены",
          buttonText: "Отлично",
          onClose: () => {
            router.refresh();
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
