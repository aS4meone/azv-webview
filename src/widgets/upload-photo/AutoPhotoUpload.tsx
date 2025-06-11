import React from "react";
import { UploadPhoto } from "./UploadPhoto";
import {
  usePhotoUpload,
  PhotoActions,
  PhotoStatus,
} from "@/shared/contexts/PhotoUploadContext";

interface AutoPhotoUploadProps {
  action: PhotoActions;
  status: PhotoStatus;
  isOpen?: boolean;
  onClose?: () => void;
  withCloseButton?: boolean;
}

export const AutoPhotoUpload: React.FC<AutoPhotoUploadProps> = ({
  action,
  status,
  isOpen = false,
  onClose,
  withCloseButton = false,
}) => {
  const { shouldShowUpload, getPhotoConfig, getUploadHandler } =
    usePhotoUpload();

  // Проверяем, нужно ли показывать интерфейс загрузки
  const shouldShow = shouldShowUpload(action, status);
  const config = getPhotoConfig(action, status);
  const uploadHandler = getUploadHandler(action, status);

  return (
    <UploadPhoto
      config={config}
      onPhotoUpload={uploadHandler}
      isOpen={isOpen}
      onClose={onClose}
      withCloseButton={withCloseButton}
    />
  );
};

export default AutoPhotoUpload;
