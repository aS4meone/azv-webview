import React, { useState } from "react";
import { Button } from "@/shared/ui";
import { useResponseModal } from "@/shared/ui/modal/ResponseModalContext";
import { UploadPhoto } from "@/widgets/upload-photo/UploadPhoto";
import { userApi } from "@/shared/api/routes/user";
import { UploadDocumentsDto } from "@/shared/models/dto/user.dto";
import { DocumentDetailsModal } from "./DocumentDetailsModal";

interface DocumentFiles {
  id_front?: File;
  id_back?: File;
  drivers_license?: File;
  selfie?: File;
}

export const UploadDocuments = ({ getUser }: { getUser: () => void }) => {
  const { showModal } = useResponseModal();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [files, setFiles] = useState<DocumentFiles>({});
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<
    Omit<
      UploadDocumentsDto,
      "id_front" | "id_back" | "drivers_license" | "selfie"
    >
  >({
    full_name: "",
    birth_date: "",
    iin: "",
    id_card_expiry: "",
    drivers_license_expiry: "",
  });

  const handlePhotoUpload = async (uploadedFiles: {
    [key: string]: File[];
  }) => {
    try {
      setIsLoading(true);
      setIsUploadOpen(false);

      const newFiles: DocumentFiles = {};

      for (const [key, fileList] of Object.entries(uploadedFiles)) {
        if (fileList.length > 0) {
          const file = fileList[0];
          newFiles[key as keyof DocumentFiles] = file;
        }
      }

      setFiles(newFiles);

      setTimeout(() => {
        setIsDetailsOpen(true);
      }, 100);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Не удалось загрузить документы. Попробуйте еще раз";
      showModal({
        type: "error",
        title: "Ошибка",
        description: errorMessage,
        buttonText: "Понятно",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (formData: typeof data) => {
    try {
      setIsLoading(true);
      const form = new FormData();

      if (files.id_front) form.append("id_front", files.id_front);
      if (files.id_back) form.append("id_back", files.id_back);
      if (files.drivers_license)
        form.append("drivers_license", files.drivers_license);
      if (files.selfie) form.append("selfie", files.selfie);

      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      const response = await userApi.uploadDocuments(form);

      setIsDetailsOpen(false);

      if (response.status === 200) {
        showModal({
          type: "success",
          title: "Успешно",
          description: "Документы успешно загружены",
          buttonText: "Хорошо",
          onButtonClick: () => {
            getUser();
            setFiles({});
            setData({
              full_name: "",
              birth_date: "",
              iin: "",
              id_card_expiry: "",
              drivers_license_expiry: "",
            });
          },
          onClose: () => {
            getUser();
            setFiles({});
            setData({
              full_name: "",
              birth_date: "",
              iin: "",
              id_card_expiry: "",
              drivers_license_expiry: "",
            });
          },
        });
      } else {
        showModal({
          type: "error",
          title: "Ошибка",
          description: "Не удалось загрузить документы. Попробуйте еще раз",
          buttonText: "Понятно",
        });
      }
    } catch (error) {
      showModal({
        type: "error",
        title: "Ошибка",
        description: error.response.data.detail,
        buttonText: "Понятно",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const uploadConfig = [
    {
      id: "id_front",
      title: "Сфотографируйте лицевую сторону удостоверения личности",
    },
    {
      id: "id_back",
      title: "Сфотографируйте обратную сторону удостоверения личности",
    },
    {
      id: "selfie",
      title: "Сделайте селфи, держа водительское удостоверение рядом с лицом",
      isSelfy: true,
    },
    {
      id: "drivers_license",
      title: "Сфотографируйте лицевую сторону водительского удостоверения",
    },
  ];

  return (
    <>
      <Button variant="secondary" onClick={() => setIsUploadOpen(true)}>
        Заменить документы
      </Button>

      <UploadPhoto
        config={uploadConfig}
        onPhotoUpload={handlePhotoUpload}
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        isLoading={isLoading}
      />

      <DocumentDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onSubmit={handleDetailsSubmit}
        initialData={data}
        isLoading={isLoading}
      />
    </>
  );
};
