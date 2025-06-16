import { PhotoConfig } from "@/widgets/upload-photo/UploadPhoto";

export const baseConfig: PhotoConfig[] = [
  {
    id: "selfie",
    title: "Сделайте селфи.",
    multiple: { min: 1, max: 1 },
  },
  {
    id: "car_photos",
    title: "Сделайте фото машины со всех сторон.",
    multiple: { min: 1, max: 1 },
    // multiple: { min: 6, max: 10 },
  },
  {
    id: "interior_photos",
    title: "Сделайте фото салона.",
    multiple: { min: 1, max: 1 },
    // multiple: { min: 4, max: 10 },
  },
];

export const ownerConfig: PhotoConfig[] = baseConfig.slice(1);
