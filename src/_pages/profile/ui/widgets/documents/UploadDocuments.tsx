import React, { useState } from "react";
import {
  Button,
  ResponseBottomModalContent,
  ResponseBottomModalContentProps,
} from "@/shared/ui";

import { PhotoConfig, UploadPhoto } from "@/widgets/upload-photo/UploadPhoto";
import { userApi } from "@/shared/api/routes/user";
import { UploadDocumentsDto } from "@/shared/models/dto/user.dto";
import { DocumentDetailsModal } from "./DocumentDetailsModal";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";

interface DocumentFiles {
  id_front?: File;
  id_back?: File;
  drivers_license?: File;
  selfie?: File;
}

export const UploadDocuments = ({ getUser }: { getUser: () => void }) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [files, setFiles] = useState<DocumentFiles>({});
  const [isLoading, setIsLoading] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalContentProps | null>(null);
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
      setResponseModal({
        type: "error",
        title: "Ошибка",
        description: errorMessage,
        buttonText: "Понятно",
        onButtonClick: () => {
          handleCloseResponseModal();
        },
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
        setResponseModal({
          type: "success",
          title: "Успешно",
          description: "Документы успешно загружены",
          buttonText: "Хорошо",
          onButtonClick: () => {
            handleCloseResponseModal();
          },
        });
      } else {
        setResponseModal({
          type: "error",
          title: "Ошибка",
          description: "Не удалось загрузить документы. Попробуйте еще раз",
          buttonText: "Понятно",
          onButtonClick: () => {
            handleCloseResponseModal();
          },
        });
      }
    } catch (error) {
      setResponseModal({
        type: "error",
        title: "Ошибка",
        description: error.response.data.detail,
        buttonText: "Понятно",
        onButtonClick: () => {
          handleCloseResponseModal();
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseResponseModal = () => {
    getUser();
    setFiles({});
    setData({
      full_name: "",
      birth_date: "",
      iin: "",
      id_card_expiry: "",
      drivers_license_expiry: "",
    });
    setResponseModal(null);
  };

  const uploadConfig: PhotoConfig[] = [
    {
      id: "id_front",
      title: "Сфотографируйте лицевую сторону удостоверения личности",
      multiple: {
        min: 1,
        max: 1,
      },
    },
    {
      id: "id_back",
      title: "Сфотографируйте обратную сторону удостоверения личности",
      multiple: {
        min: 1,
        max: 1,
      },
    },
    {
      id: "selfie",
      title: "Сделайте селфи, держа водительское удостоверение рядом с лицом",
      isSelfy: true, // Только это селфи!
      multiple: {
        min: 1,
        max: 1,
      },
    },
    {
      id: "drivers_license",
      title: "Сфотографируйте лицевую сторону водительского удостоверения",
      multiple: {
        min: 1,
        max: 1,
      },
    },
  ];

  return (
    <>
      <Button variant="secondary" onClick={() => setIsUploadOpen(true)}>
        Заменить документы
      </Button>

      <UploadPhoto
        config={uploadConfig}
        withCloseButton
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
      <CustomPushScreen
        isOpen={!!responseModal}
        onClose={() => {
          handleCloseResponseModal();
        }}
        withHeader={false}
        fullScreen={false}
        direction="bottom"
        height="auto"
      >
        <ResponseBottomModalContent
          type={responseModal?.type || "success"}
          title={responseModal?.title || ""}
          description={responseModal?.description || ""}
          buttonText={responseModal?.buttonText || ""}
          onButtonClick={() => {
            handleCloseResponseModal();
          }}
        />
      </CustomPushScreen>
    </>
  );
};
