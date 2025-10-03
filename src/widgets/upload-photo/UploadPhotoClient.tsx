"use client";

import dynamic from "next/dynamic";
import { PhotoConfig } from "./UploadPhoto";

// Динамический импорт с отключением SSR
const UploadPhoto = dynamic(() => import("./UploadPhoto").then(mod => ({ default: mod.UploadPhoto })), {
  ssr: false,
  loading: () => <div>Loading...</div>
});

export interface UploadPhotoClientProps {
  config: PhotoConfig[];
  onPhotoUpload: (files: { [key: string]: File[] }) => void;
  isOpen?: boolean;
  onClose?: () => void;
  withCloseButton?: boolean;
  isLoading?: boolean;
  isCloseable?: boolean;
  // Флаги из API для определения уже загруженных фотографий (ДО осмотра)
  photoBeforeSelfieUploaded?: boolean;
  photoBeforeCarUploaded?: boolean;
  photoBeforeInteriorUploaded?: boolean;
  // Флаги из API для определения уже загруженных фотографий (ПОСЛЕ осмотра)
  photoAfterSelfieUploaded?: boolean;
  photoAfterCarUploaded?: boolean;
  photoAfterInteriorUploaded?: boolean;
}

export const UploadPhotoClient: React.FC<UploadPhotoClientProps> = (props) => {
  return <UploadPhoto {...props} />;
};

