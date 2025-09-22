"use client";

import React, { useState } from "react";
import {
  Button,
  ResponseBottomModalContent,
  ResponseBottomModalContentProps,
} from "@/shared/ui";

import { PhotoConfig } from "@/widgets/upload-photo/UploadPhoto";
import { UploadPhotoClient as UploadPhoto } from "@/widgets/upload-photo/UploadPhotoClient";
import { userApi } from "@/shared/api/routes/user";
import { UploadDocumentsDto } from "@/shared/models/dto/user.dto";
import { DocumentDetailsModal } from "./DocumentDetailsModal";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { useTranslations } from "next-intl";

interface DocumentFiles {
  id_front?: File;
  id_back?: File;
  drivers_license?: File;
  selfie?: File;
  selfie_with_license?: File;
}

export const UploadDocuments = ({ getUser }: { getUser: () => void }) => {
  const t = useTranslations("profile");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [files, setFiles] = useState<DocumentFiles>({});
  const [isLoading, setIsLoading] = useState(false);
  const [responseModal, setResponseModal] =
    useState<ResponseBottomModalContentProps | null>(null);
  const [data, setData] = useState<
    Omit<
      UploadDocumentsDto,
      | "id_front"
      | "id_back"
      | "drivers_license"
      | "selfie"
      | "selfie_with_license"
    > & {
      first_name?: string;
      last_name?: string;
    }
  >({
    full_name: "",
    first_name: "",
    last_name: "",
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
          : t("failedToUploadDocuments");
      setResponseModal({
        type: "error",
        title: t("error"),
        description: errorMessage,
        buttonText: t("understood"),
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
      if (files.selfie_with_license)
        form.append("selfie_with_license", files.selfie_with_license);

      Object.entries(formData).forEach(([key, value]) => {
        if (value) form.append(key, value);
      });

      const response = await userApi.uploadDocuments(form);

      setIsDetailsOpen(false);

      if (response.status === 200) {
        setResponseModal({
          type: "success",
          title: t("success"),
          description: t("documentsUploadedSuccessfully"),
          buttonText: t("ok"),
          onButtonClick: () => {
            handleCloseResponseModal();
          },
        });
      } else {
        setResponseModal({
          type: "error",
          title: t("error"),
          description: t("failedToUploadDocuments"),
          buttonText: t("understood"),
          onButtonClick: () => {
            handleCloseResponseModal();
          },
        });
      }
    } catch (error) {
      setResponseModal({
        type: "error",
        title: t("error"),
        description: error.response.data.detail,
        buttonText: t("understood"),
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
      first_name: "",
      last_name: "",
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
      title: t("photoInstructions.idFront"),
      multiple: { min: 1, max: 1 },
      stencil: { type: "rect", rect: { aspect: 1.58, widthPct: 86, borderRadiusPct: 3, offsetYPct: -2 } }
    },
    {
      id: "id_back",
      title: t("photoInstructions.idBack"),
      multiple: { min: 1, max: 1 },
      stencil: { type: "rect", rect: { aspect: 1.58, widthPct: 86, borderRadiusPct: 3, offsetYPct: -2 } }
    },
    {
      id: "selfie_with_license",
      title: t("photoInstructions.selfieWithLicense"),
      isSelfy: true,
      multiple: { min: 1, max: 1 },
      stencil: {
        type: "rect+circle",
        rect: { aspect: 1.58, widthPct: 72, borderRadiusPct: 3, offsetYPct: 18 },
        circle: { diameterPct: 46, offsetYPct: -14 }
      }
    },
    {
      id: "drivers_license",
      title: t("photoInstructions.driversLicense"),
      multiple: { min: 1, max: 1 },
      stencil: { type: "rect", rect: { aspect: 1.58, widthPct: 86, borderRadiusPct: 3, offsetYPct: -2 } }
    },
    {
      id: "selfie",
      title: t("photoInstructions.selfie"),
      isSelfy: true,
      multiple: { min: 1, max: 1 },
      stencil: { type: "circle", circle: { diameterPct: 58, offsetYPct: -6 } }
    },
  ];

  return (
    <>
      <Button variant="secondary" onClick={() => setIsUploadOpen(true)}>
        {t("replaceDocumentsButton")}
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
