import React from "react";
import { createPortal } from "react-dom";
import { Input, Button } from "@/shared/ui";
import { UploadDocumentsDto } from "@/shared/models/dto/user.dto";

import PushScreen from "@/shared/ui/push-screen";
import Loader from "@/shared/ui/loader";

type DocumentDetailsData = Omit<
  UploadDocumentsDto,
  "id_front" | "id_back" | "drivers_license" | "selfie"
>;

interface DocumentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentDetailsData) => void;
  initialData: DocumentDetailsData;
  isLoading?: boolean;
}

export const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [formData, setFormData] =
    React.useState<DocumentDetailsData>(initialData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.focus({ preventScroll: false });
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = React.useMemo(() => {
    return (
      formData.full_name.length >= 2 &&
      formData.full_name.length <= 100 &&
      formData.birth_date &&
      formData.iin.length === 12 &&
      /^\d{12}$/.test(formData.iin) &&
      formData.id_card_expiry &&
      formData.drivers_license_expiry
    );
  }, [formData]);

  return isOpen && typeof window !== "undefined"
    ? createPortal(
        <PushScreen onClose={onClose} withCloseButton={false}>
          <form onSubmit={handleSubmit} className="space-y-4 pt-8">
            <Input
              label="ФИО"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
            />
            <Input
              label="Дата рождения"
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleChange}
              required
            />
            <Input
              label="ИИН"
              name="iin"
              value={formData.iin}
              onChange={handleChange}
              required
              minLength={12}
              maxLength={12}
              pattern="[0-9]{12}"
            />
            <Input
              label="Срок действия удостоверения личности"
              name="id_card_expiry"
              type="date"
              value={formData.id_card_expiry}
              onChange={handleChange}
              required
            />
            <Input
              label="Срок действия водительского удостоверения"
              name="drivers_license_expiry"
              type="date"
              value={formData.drivers_license_expiry}
              onChange={handleChange}
              required
            />
            {isFormValid && (
              <div className="fixed bottom-0 left-0 right-0 p-8 bg-white">
                <Button
                  variant="secondary"
                  onClick={handleSubmit}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader color="#fff" /> : "Отправить"}
                </Button>
              </div>
            )}
          </form>
        </PushScreen>,
        document.body
      )
    : null;
};
