import React from "react";
import { createPortal } from "react-dom";
import { Input, Button } from "@/shared/ui";
import { UploadDocumentsDto } from "@/shared/models/dto/user.dto";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
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
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const validateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age >= 18;
  };

  const validateFutureDate = (date: string) => {
    const inputDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return inputDate > tomorrow;
  };

  const validateFullName = (name: string) => {
    if (name.length < 2) {
      return "ФИО должно содержать минимум 2 символа";
    }
    if (name.length > 100) {
      return "ФИО не может быть длиннее 100 символов";
    }
    // Check for at least two words with proper capitalization
    const words = name.trim().split(/\s+/);
    if (words.length < 2) {
      return "Введите полное ФИО (имя и фамилию)";
    }

    return "";
  };

  const validateIIN = (iin: string) => {
    if (!/^\d{12}$/.test(iin)) {
      return "ИИН должен содержать 12 цифр";
    }

    // Validate birth date from IIN with form birth date
    if (formData.birth_date) {
      const birthDate = new Date(formData.birth_date);
      const birthYear = birthDate.getFullYear() % 100;
      const birthMonth = birthDate.getMonth() + 1;
      const birthDay = birthDate.getDate();

      const iinYear = parseInt(iin.slice(0, 2));
      const iinMonth = parseInt(iin.slice(2, 4));
      const iinDay = parseInt(iin.slice(4, 6));

      if (
        birthYear !== iinYear ||
        birthMonth !== iinMonth ||
        birthDay !== iinDay
      ) {
        return "ИИН не соответствует указанной дате рождения";
      }
    }

    // Validate IIN checksum
    const weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      sum += parseInt(iin[i]) * weights[i];
    }
    const control = sum % 11;
    const lastDigit = parseInt(iin[11]);

    if (control === 10) {
      return "Неверный ИИН";
    }
    if (control !== lastDigit) {
      return "Неверная контрольная сумма ИИН";
    }

    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.target.focus({ preventScroll: false });
    const { name, value } = e.target;

    let newErrors = { ...errors };
    delete newErrors[name];

    // Validate full name
    if (name === "full_name") {
      const nameError = validateFullName(value);
      if (nameError) {
        newErrors.full_name = nameError;
      }
    }

    // Validate IIN
    if (name === "iin") {
      if (value.length === 12) {
        const iinError = validateIIN(value);
        if (iinError) {
          newErrors.iin = iinError;
        }
      }
    }

    // Validate birth date
    if (name === "birth_date" && value) {
      if (!validateAge(value)) {
        newErrors.birth_date = "Возраст должен быть не менее 18 лет";
      }
      // Revalidate IIN when birth date changes
      if (formData.iin.length === 12) {
        const iinError = validateIIN(formData.iin);
        if (iinError) {
          newErrors.iin = iinError;
        }
      }
    }

    // Validate document expiry dates
    if (
      (name === "id_card_expiry" || name === "drivers_license_expiry") &&
      value
    ) {
      if (!validateFutureDate(value)) {
        newErrors[name] = "Дата должна быть в будущем";
      }
    }

    setErrors(newErrors);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isFormValid = React.useMemo(() => {
    // Validate all fields
    const nameError = validateFullName(formData.full_name);
    const iinError =
      formData.iin.length === 12
        ? validateIIN(formData.iin)
        : "ИИН должен содержать 12 цифр";

    return (
      !nameError &&
      formData.birth_date &&
      validateAge(formData.birth_date) &&
      !iinError &&
      formData.id_card_expiry &&
      validateFutureDate(formData.id_card_expiry) &&
      formData.drivers_license_expiry &&
      validateFutureDate(formData.drivers_license_expiry) &&
      Object.keys(errors).length === 0
    );
  }, [formData, errors]);

  const getMaxDate = (years: number) => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date.toISOString().split("T")[0];
  };

  const getMinBirthDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return date.toISOString().split("T")[0];
  };

  const getMaxBirthDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split("T")[0];
  };

  return isOpen && typeof window !== "undefined"
    ? createPortal(
        <CustomPushScreen
          isOpen={true}
          onClose={onClose}
          direction="bottom"
          withHeader={true}
          title="Данные документов"
        >
          <form onSubmit={handleSubmit} className="space-y-4 pt-8">
            <Input
              label="ФИО"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
              error={errors.full_name}
              placeholder="Иванов Иван Иванович"
            />
            <Input
              label="Дата рождения"
              name="birth_date"
              type="date"
              value={formData.birth_date}
              onChange={handleChange}
              required
              max={getMaxBirthDate()}
              min={getMinBirthDate()}
              error={errors.birth_date}
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
              error={errors.iin}
              placeholder="XXXXXXXXXXXX"
            />
            <Input
              label="Срок действия удостоверения личности"
              name="id_card_expiry"
              type="date"
              value={formData.id_card_expiry}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              max={getMaxDate(10)}
              error={errors.id_card_expiry}
            />
            <Input
              label="Срок действия водительского удостоверения"
              name="drivers_license_expiry"
              type="date"
              value={formData.drivers_license_expiry}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              max={getMaxDate(10)}
              error={errors.drivers_license_expiry}
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
        </CustomPushScreen>,
        document.body
      )
    : null;
};
