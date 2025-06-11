// "use client";
// import React, {
//   useContext,
//   useState,
//   ReactNode,
//   createContext,
//   useEffect,
// } from "react";
// import { PhotoConfig } from "@/widgets/upload-photo/UploadPhoto";

import { PhotoConfig } from "@/widgets/upload-photo/UploadPhoto";

// // Константы статусов из isPhotoSend.ts
// const USER_UPLOAD_STATUS_AFTER = "userupload_after";
// const USER_UPLOAD_STATUS_BEFORE = "userupload_before";
// const OWNER_UPLOAD_STATUS_AFTER = "ownerupload_after";
// const OWNER_UPLOAD_STATUS_BEFORE = "ownerupload_before";
// const MECHANIC_CHECKUP_STATUS_AFTER = "mechanic_checkup_after";
// const MECHANIC_CHECKUP_STATUS_BEFORE = "mechanic_checkup_before";
// const MECHANIC_DELIVERY_STATUS_AFTER = "mechanic_delivery_after";
// const MECHANIC_DELIVERY_STATUS_BEFORE = "mechanic_delivery_before";

// export enum PhotoActions {
//   userupload = "userupload",
//   ownerupload = "ownerupload",
//   mechanic_checkup = "mechanic_checkup",
//   mechanic_delivery = "mechanic_delivery",
// }

// export enum PhotoStatus {
//   after = "after",
//   before = "before",
// }

export const baseConfig: PhotoConfig[] = [
  {
    id: "selfie",
    title: "Сделайте селфи, перед началом использования авто.",
    isSelfy: true,
  },
  {
    id: "car_photos",
    title: "Сделайте фото машины со всех сторон. Минимум 6, максимум 10.",
    multiple: { min: 1, max: 10 },
  },
  {
    id: "interior_photos",
    title: "Сделайте фото салона. Минимум 5, максимум 10.",
    multiple: { min: 1, max: 10 },
  },
];

// export interface PhotoUploadConfig {
//   action: PhotoActions;
//   status: PhotoStatus;
//   config: PhotoConfig[];
//   onPhotoUpload: (files: { [key: string]: File[] }) => void;
// }

// interface PhotoUploadContextType {
//   shouldShowUpload: (action: PhotoActions, status: PhotoStatus) => boolean;
//   markPhotoAsUploaded: (action: PhotoActions, status: PhotoStatus) => void;
//   initPhotoCheck: (action: PhotoActions, status: PhotoStatus) => void;
//   getPhotoConfig: (
//     action: PhotoActions,
//     status: PhotoStatus
//   ) => PhotoConfig[] | null;
//   getUploadHandler: (
//     action: PhotoActions,
//     status: PhotoStatus
//   ) => ((files: { [key: string]: File[] }) => void) | null;
//   registerPhotoUpload: (config: PhotoUploadConfig) => void;
//   configs: Map<string, PhotoUploadConfig>;
// }

// const PhotoUploadContext = createContext<PhotoUploadContextType | undefined>(
//   undefined
// );

// // Функция для получения ключа localStorage
// const getStorageKey = (action: PhotoActions, status: PhotoStatus): string => {
//   const keyMap = {
//     [`${PhotoActions.userupload}_${PhotoStatus.after}`]:
//       USER_UPLOAD_STATUS_AFTER,
//     [`${PhotoActions.userupload}_${PhotoStatus.before}`]:
//       USER_UPLOAD_STATUS_BEFORE,
//     [`${PhotoActions.ownerupload}_${PhotoStatus.after}`]:
//       OWNER_UPLOAD_STATUS_AFTER,
//     [`${PhotoActions.ownerupload}_${PhotoStatus.before}`]:
//       OWNER_UPLOAD_STATUS_BEFORE,
//     [`${PhotoActions.mechanic_checkup}_${PhotoStatus.after}`]:
//       MECHANIC_CHECKUP_STATUS_AFTER,
//     [`${PhotoActions.mechanic_checkup}_${PhotoStatus.before}`]:
//       MECHANIC_CHECKUP_STATUS_BEFORE,
//     [`${PhotoActions.mechanic_delivery}_${PhotoStatus.after}`]:
//       MECHANIC_DELIVERY_STATUS_AFTER,
//     [`${PhotoActions.mechanic_delivery}_${PhotoStatus.before}`]:
//       MECHANIC_DELIVERY_STATUS_BEFORE,
//   };
//   return keyMap[`${action}_${status}`];
// };

// // Конфигурации по умолчанию для разных типов фотографий
// const getDefaultPhotoConfig = (
//   action: PhotoActions,
//   status: PhotoStatus
// ): PhotoConfig[] => {
//   switch (action) {
//     case PhotoActions.userupload:
//       return baseConfig;

//     case PhotoActions.ownerupload:
//       return baseConfig.slice(1);

//     case PhotoActions.mechanic_checkup:
//       return baseConfig;

//     case PhotoActions.mechanic_delivery:
//       return baseConfig;

//     default:
//       return baseConfig;
//   }
// };

// export const PhotoUploadProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [configs] = useState<Map<string, PhotoUploadConfig>>(new Map());

//   const initPhotoCheck = (action: PhotoActions, status: PhotoStatus) => {
//     const storageKey = getStorageKey(action, status);
//     localStorage.setItem(storageKey, "false");
//   };

//   const shouldShowUpload = (
//     action: PhotoActions,
//     status: PhotoStatus
//   ): boolean => {
//     const storageKey = getStorageKey(action, status);
//     const value = localStorage.getItem(storageKey);

//     console.log(
//       `shouldShowUpload: ${action}_${status}, storageKey: ${storageKey}, value: ${value}`
//     );

//     return value === "false";
//   };

//   // Отметить фото как загруженное
//   const markPhotoAsUploaded = (action: PhotoActions, status: PhotoStatus) => {
//     const storageKey = getStorageKey(action, status);
//     localStorage.setItem(storageKey, "true");
//   };

//   useEffect(() => {
//     initPhotoCheck(PhotoActions.userupload, PhotoStatus.after);
//   }, []);

//   const getPhotoConfig = (
//     action: PhotoActions,
//     status: PhotoStatus
//   ): PhotoConfig[] | null => {
//     const key = `${action}_${status}`;
//     const registeredConfig = configs.get(key);

//     if (registeredConfig) {
//       return registeredConfig.config;
//     }

//     return getDefaultPhotoConfig(action, status);
//   };

//   const getUploadHandler = (
//     action: PhotoActions,
//     status: PhotoStatus
//   ): ((files: { [key: string]: File[] }) => void) | null => {
//     const key = `${action}_${status}`;
//     const registeredConfig = configs.get(key);

//     if (registeredConfig) {
//       return registeredConfig.onPhotoUpload;
//     }

//     return (files: { [key: string]: File[] }) => {
//       console.log(`Uploaded files for ${action} ${status}:`, files);
//       markPhotoAsUploaded(action, status);
//     };
//   };

//   const registerPhotoUpload = (config: PhotoUploadConfig) => {
//     const key = `${config.action}_${config.status}`;
//     configs.set(key, config);
//   };

//   const value: PhotoUploadContextType = {
//     shouldShowUpload,
//     markPhotoAsUploaded,
//     initPhotoCheck,
//     getPhotoConfig,
//     getUploadHandler,
//     registerPhotoUpload,
//     configs,
//   };

//   return (
//     <PhotoUploadContext.Provider value={value}>
//       {children}
//     </PhotoUploadContext.Provider>
//   );
// };

// export const usePhotoUpload = (): PhotoUploadContextType => {
//   const context = useContext(PhotoUploadContext);
//   if (!context) {
//     throw new Error("usePhotoUpload must be used within a PhotoUploadProvider");
//   }
//   return context;
// };
