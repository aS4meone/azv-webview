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
import { EmailVerificationModal } from "./EmailVerificationModal";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import { useTranslations } from "next-intl";
import { useErrorTranslator } from "@/shared/utils/errorTranslator";
import { UserRole } from "@/shared/models/types/user";

interface DocumentFiles {
  id_front?: File;
  id_back?: File;
  drivers_license?: File;
  selfie?: File;
  selfie_with_license?: File;
  psych_neurology_certificate?: File;
  narcology_certificate?: File;
  pension_contributions_certificate?: File;
}

export const UploadDocuments = ({ getUser, user }: { getUser: () => void; user?: any }) => {
  const t = useTranslations("profile");
  const errorTranslator = useErrorTranslator();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEmailVerificationOpen, setIsEmailVerificationOpen] = useState(false);
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
      is_rk_citizen?: boolean;
    }
  >({
    full_name: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    iin: "",
    id_card_expiry: "",
    drivers_license_expiry: "",
    email: "",
    is_rk_citizen: false,
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
          handleCloseErrorModal();
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDetailsSubmit = async (formData: typeof data, certificateFiles?: any) => {
    try {
      setIsLoading(true);

      // Validate required files before submission
      const missingFiles: string[] = [];
      if (!files.id_front) missingFiles.push(t("photoInstructions.idFront"));
      if (!files.id_back) missingFiles.push(t("photoInstructions.idBack"));
      if (!files.drivers_license) missingFiles.push(t("photoInstructions.driversLicense"));
      if (!files.selfie) missingFiles.push(t("photoInstructions.selfie"));
      if (!files.selfie_with_license) missingFiles.push(t("photoInstructions.selfieWithLicense"));

      if (missingFiles.length > 0) {
        setResponseModal({
          type: "error",
          title: t("error"),
          description: `${t("missingRequiredFiles")}: ${missingFiles.join(", ")}`,
          buttonText: t("understood"),
          onButtonClick: () => {
            handleCloseErrorModal();
          },
        });
        setIsLoading(false);
        return;
      }

      const form = new FormData();

      // Non-null assertion is safe here because we validated above
      form.append("id_front", files.id_front!);
      form.append("id_back", files.id_back!);
      form.append("drivers_license", files.drivers_license!);
      form.append("selfie", files.selfie!);
      form.append("selfie_with_license", files.selfie_with_license!);

      // Add certificate files if user is RK citizen and files were uploaded
      if (formData.is_rk_citizen && certificateFiles) {
        if (certificateFiles.psych_neurology_certificate) 
          form.append("psych_neurology_certificate", certificateFiles.psych_neurology_certificate);
        if (certificateFiles.narcology_certificate) 
          form.append("narcology_certificate", certificateFiles.narcology_certificate);
        if (certificateFiles.pension_contributions_certificate) 
          form.append("pension_contributions_certificate", certificateFiles.pension_contributions_certificate);
      }

      // Add required form fields that backend expects
      form.append("first_name", formData.first_name || "");
      form.append("last_name", formData.last_name || "");
      form.append("birth_date", formData.birth_date || "");
      form.append("id_card_expiry", formData.id_card_expiry || "");
      form.append("drivers_license_expiry", formData.drivers_license_expiry || "");
      form.append("email", formData.email || "");
      
      // Add citizenship status (backend expects is_citizen_kz)
      form.append("is_citizen_kz", formData.is_rk_citizen ? "true" : "false");

      // Add optional fields (iin or passport_number)
      if (formData.iin) {
        form.append("iin", formData.iin);
      }
      if (formData.passport_number) {
        form.append("passport_number", formData.passport_number);
      }

      const response = await userApi.uploadDocuments(form);

      setIsDetailsOpen(false);

      if (response.status === 200) {
        // Check if email verification is needed based on backend response
        const needsEmailVerification = response.data?.data?.is_verified_email === false;
        
        setResponseModal({
          type: "success",
          title: t("success"),
          description: t("documentsUploadedSuccessfully"),
          buttonText: t("ok"),
          onButtonClick: () => {
            handleCloseResponseModal();
            // Open email verification modal only if email needs verification
            if (needsEmailVerification) {
              setTimeout(() => {
                setIsEmailVerificationOpen(true);
              }, 100);
            }
          },
        });
      } else {
        setResponseModal({
          type: "error",
          title: t("error"),
          description: t("failedToUploadDocuments"),
          buttonText: t("understood"),
          onButtonClick: () => {
            handleCloseErrorModal();
          },
        });
      }
    } catch (error) {
      const errorMessage = errorTranslator.translateApiError(error?.response?.data || error);
      setResponseModal({
        type: "error",
        title: t("error"),
        description: errorMessage,
        buttonText: t("understood"),
        onButtonClick: () => {
          handleCloseErrorModal();
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerificationSuccess = () => {
    setIsEmailVerificationOpen(false);
    setResponseModal({
      type: "success",
      title: t("success"),
      description: t("emailVerification.successMessage"),
      buttonText: t("ok"),
      onButtonClick: () => {
        handleCloseResponseModal();
      },
    });
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
      email: "",
      is_rk_citizen: false,
    });
    setResponseModal(null);
  };

  const handleCloseErrorModal = () => {
    // Just close the modal without resetting files and data
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
      {user.role !== UserRole.USER && (
        <Button variant="secondary" onClick={() => setIsUploadOpen(true)}>
          {user && (user.documents.id_card.front_url || 
                    user.documents.id_card.back_url || 
                    user.documents.drivers_license.url || 
                    user.documents.selfie_url || 
                    user.documents.selfie_with_license_url) 
            ? (user.role === UserRole.REJECTFIRSTDOC ? t("reuploadDocumentsButton") : 
               user.role === UserRole.PENDINGTOFIRST ? t("updateDocumentsButton") : 
               t("replaceDocumentsButton"))
            : t("uploadDocumentsButton")}
        </Button>
      )}
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

      <EmailVerificationModal
        isOpen={isEmailVerificationOpen}
        onClose={() => setIsEmailVerificationOpen(false)}
        onSuccess={handleEmailVerificationSuccess}
        email={data.email || ""}
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
            responseModal?.onButtonClick?.();
          }}
        />
      </CustomPushScreen>
    </>
  );
};
