import React, { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { Input, Button, DatePicker } from "@/shared/ui";
import { UploadDocumentsDto } from "@/shared/models/dto/user.dto";
import { CustomPushScreen } from "@/components/ui/custom-push-screen";
import Loader from "@/shared/ui/loader";
import { useTranslations } from "next-intl";
import { useUserStore } from "@/shared/stores/userStore";
import { validateIINBirthDateMatch } from "@/shared/utils/iinValidation";

type DocumentDetailsData = Omit<
  UploadDocumentsDto,
  "id_front" | "id_back" | "drivers_license" | "selfie" | "selfie_with_license"
> & {
  first_name?: string;
  last_name?: string;
  document_type?: 'iin' | 'passport';
};

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
  const t = useTranslations("profile");
  const [formData, setFormData] = React.useState<DocumentDetailsData>(() => {
    // Split full_name into first_name and last_name if it exists
    const fullName = initialData.full_name || "";
    const nameParts = fullName.trim().split(/\s+/);
    return {
      ...initialData,
      first_name: nameParts[0] || "",
      last_name: nameParts.slice(1).join(" ") || "",
      document_type: initialData.iin ? 'iin' : 'passport',
      // Не загружаем даты истечения документов при инициализации
      id_card_expiry: "",
      drivers_license_expiry: "",
    };
  });
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const { user, isLoading: isLoadingUser } = useUserStore();

  // Load user data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      loadUserData();
    }
  }, [isOpen, user]);

  const loadUserData = () => {
    if (!user) return;
    
    setFormData(prev => ({
      ...prev,
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      // birth_date, iin, id_card_expiry и drivers_license_expiry не загружаем из user, оставляем как есть
      // id_card_expiry: user.documents?.id_card?.expiry || prev.id_card_expiry,
      // drivers_license_expiry: user.documents?.drivers_license?.expiry || prev.drivers_license_expiry,
    }));
  };

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
    return inputDate >= today;
  };

  const validateFirstName = (name: string) => {
    if (name.length < 2) {
      return t("validation.firstNameMinLength");
    }
    if (name.length > 50) {
      return t("validation.firstNameMaxLength");
    }
    return "";
  };

  const validateLastName = (name: string) => {
    if (name.length < 2) {
      return t("validation.lastNameMinLength");
    }
    if (name.length > 50) {
      return t("validation.lastNameMaxLength");
    }
    return "";
  };

  const validateIIN = useCallback(
    (iin: string) => {
      if (!/^\d{12}$/.test(iin)) {
        return t("validation.iinLength");
      }
      
      // Проверяем соответствие 7-й цифры ИИН дате рождения
      if (formData.birth_date && iin.length === 12) {
        const isValidMatch = validateIINBirthDateMatch(iin, formData.birth_date);
        if (!isValidMatch) {
          return t("validation.iinMismatch");
        }
      }
      
      return "";
    },
    [t, formData.birth_date]
  );

  const validatePassportNumber = (passport: string) => {
    if (!passport.trim()) return t("validation.passportRequired");
    if (passport.trim().length < 3) return t("validation.passportMinLength");
    return "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine first_name and last_name into full_name for backend
    const submitData = {
      ...formData,
      full_name: `${formData.first_name || ""} ${formData.last_name || ""}`.trim(),
    };
    onSubmit(submitData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Проверяем, что target имеет метод focus (настоящий DOM элемент)
    if (e.target && typeof e.target.focus === 'function') {
      e.target.focus({ preventScroll: false });
    }
    const { name, value } = e.target;
    
    console.log("DocumentDetailsModal handleChange:", { name, value, type: e.target.type });

    const newErrors = { ...errors };
    delete newErrors[name];

    // Validate first name
    if (name === "first_name") {
      const nameError = validateFirstName(value);
      if (nameError) {
        newErrors.first_name = nameError;
      }
    }

    // Validate last name
    if (name === "last_name") {
      const nameError = validateLastName(value);
      if (nameError) {
        newErrors.last_name = nameError;
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

    // Validate passport number
    if (name === "passport_number") {
      const passportError = validatePassportNumber(value);
      if (passportError) {
        newErrors.passport_number = passportError;
      }
    }

    // Validate birth date (only basic validation)
    if (name === "birth_date" && value) {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birth_date = t("validation.birthDateFuture");
      }
    }

    // Validate document expiry dates (only basic validation)
    if (
      (name === "id_card_expiry" || name === "drivers_license_expiry") &&
      value
    ) {
      const expiryDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (expiryDate < today) {
        newErrors[name] = t("validation.expiryDatePast");
      }
    }

    setErrors(newErrors);
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      };
      console.log("DocumentDetailsModal setFormData:", { name, value, newData });
      return newData;
    });
  };

  const handleClearField = (fieldName: keyof DocumentDetailsData) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: "",
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  const handleDocumentTypeChange = (type: 'iin' | 'passport') => {
    setFormData((prev) => ({
      ...prev,
      document_type: type,
      iin: type === 'iin' ? prev.iin : '',
      passport_number: type === 'passport' ? prev.passport_number : '',
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.iin;
      delete newErrors.passport_number;
      return newErrors;
    });
  };

  const isFormValid = React.useMemo(() => {
    // Check if all required fields are filled (basic validation only)
    const hasFirstName = (formData.first_name || "").trim().length >= 2;
    const hasLastName = (formData.last_name || "").trim().length >= 2;
    const hasBirthDate = !!formData.birth_date;
    const hasIIN = formData.document_type === 'iin' && (formData.iin || "").length === 12;
    const hasPassport = formData.document_type === 'passport' && (formData.passport_number || "").trim().length > 0;
    const hasDocumentId = hasIIN || hasPassport;
    const hasIdExpiry = !!formData.id_card_expiry;
    const hasLicenseExpiry = !!formData.drivers_license_expiry;

    const isValid = (
      hasFirstName &&
      hasLastName &&
      hasBirthDate &&
      hasDocumentId &&
      hasIdExpiry &&
      hasLicenseExpiry
    );

    // Debug information
    console.log("Form validation debug:", {
      hasFirstName,
      hasLastName,
      hasBirthDate,
      hasIIN,
      hasPassport,
      hasDocumentId,
      hasIdExpiry,
      hasLicenseExpiry,
      isValid,
      formData,
      errors
    });

    return isValid;
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
          title={t("documentData")}
        >
          <div className="bg-white min-h-full mt-5">
            

            {/* Form content */}
            <div className="py-6 space-y-6">
              {isLoadingUser && (
                <div className="flex items-center justify-center py-8">
                  <Loader color="#191919" />
                  <span className="ml-2 text-sm text-gray-600">{t("loadingUserData")}</span>
                </div>
              )}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <h3 className="text-lg font-semibold text-[#191919] mb-6 flex items-center gap-3">
                  
                  <div>
                    <div className="text-lg font-semibold text-[#191919]">{t("personalDataSection")}</div>
                    <div className="text-sm text-[#666666]">{t("personalDataDescription")}</div>
                  </div>
                </h3>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      label={t("firstName")}
                      name="first_name"
                      value={formData.first_name || ""}
                      onChange={handleChange}
                      required
                      minLength={2}
                      maxLength={50}
                      error={errors.first_name}
                      placeholder={t("enterFirstName")}
                      showClearButton={!!formData.first_name}
                      onClear={() => handleClearField("first_name")}
                    />
                    <Input
                      label={t("lastName")}
                      name="last_name"
                      value={formData.last_name || ""}
                      onChange={handleChange}
                      required
                      minLength={2}
                      maxLength={50}
                      error={errors.last_name}
                      placeholder={t("enterLastName")}
                      showClearButton={!!formData.last_name}
                      onClear={() => handleClearField("last_name")}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <DatePicker
                        label={t("birthDate")}
                        name="birth_date"
                        value={formData.birth_date || ""}
                        onChange={handleChange}
                        error={errors.birth_date}
                        placeholder="Выберите дату рождения"
                        required
                        max={getMaxBirthDate()}
                        min={getMinBirthDate()}
                      />
                      {/* Debug info for DatePicker */}
                      <div className="text-xs text-gray-500 mt-1">
                        DatePicker value: "{formData.birth_date}" | Error: "{errors.birth_date}"
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t("documentType")}
                      </label>
                      <div className="flex space-x-4 mb-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="document_type"
                            value="iin"
                            checked={formData.document_type === 'iin'}
                            onChange={() => handleDocumentTypeChange('iin')}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{t("iin")}</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="document_type"
                            value="passport"
                            checked={formData.document_type === 'passport'}
                            onChange={() => handleDocumentTypeChange('passport')}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{t("passportNumber")}</span>
                        </label>
                      </div>
                      
                      {formData.document_type === 'iin' ? (
                        <Input
                          label={t("iin")}
                          name="iin"
                          value={formData.iin || ""}
                          onChange={handleChange}
                          required
                          minLength={12}
                          maxLength={12}
                          pattern="[0-9]{12}"
                          error={errors.iin}
                          placeholder={t("iinPlaceholder")}
                          showClearButton={!!formData.iin}
                          onClear={() => handleClearField("iin")}
                        />
                      ) : (
                        <Input
                          label={t("passportNumber")}
                          name="passport_number"
                          value={formData.passport_number || ""}
                          onChange={handleChange}
                          required
                          error={errors.passport_number}
                          placeholder={t("passportNumberPlaceholder")}
                          showClearButton={!!formData.passport_number}
                          onClear={() => handleClearField("passport_number")}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <h3 className="text-lg font-semibold text-[#191919] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#191919] flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-[#191919]">{t("documentExpirySection")}</div>
                    <div className="text-sm text-[#666666]">{t("documentExpiryDescription")}</div>
                  </div>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <DatePicker
                      label={t("idCardExpiry")}
                      name="id_card_expiry"
                      value={formData.id_card_expiry || ""}
                      onChange={handleChange}
                      error={errors.id_card_expiry}
                      placeholder="Выберите дату истечения"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      max={getMaxDate(10)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      ID Card DatePicker: "{formData.id_card_expiry}"
                    </div>
                  </div>
                  <div>
                    <DatePicker
                      label={t("driversLicenseExpiry")}
                      name="drivers_license_expiry"
                      value={formData.drivers_license_expiry || ""}
                      onChange={handleChange}
                      error={errors.drivers_license_expiry}
                      placeholder="Выберите дату истечения"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      max={getMaxDate(10)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      License DatePicker: "{formData.drivers_license_expiry}"
                    </div>
                  </div>
                </div>
              </div>

              {/* Debug information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">Отладочная информация:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Имя: "{formData.first_name}" (длина: {formData.first_name?.length || 0})</div>
                  <div>Фамилия: "{formData.last_name}" (длина: {formData.last_name?.length || 0})</div>
                  <div>Дата рождения: "{formData.birth_date}"</div>
                  <div>ИИН: "{formData.iin}" (длина: {formData.iin?.length || 0})</div>
                  <div>Срок удостоверения: "{formData.id_card_expiry}"</div>
                  <div>Срок водительского: "{formData.drivers_license_expiry}"</div>
                  <div className="mt-2 font-semibold">Валидация: {isFormValid ? "✅ Валидна" : "❌ Невалидна"}</div>
                </div>
              </div>

              {!isFormValid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">Не заполнены обязательные поля:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {(!formData.first_name || formData.first_name.trim().length < 2) && (
                      <li>• Имя (минимум 2 символа)</li>
                    )}
                    {(!formData.last_name || formData.last_name.trim().length < 2) && (
                      <li>• Фамилия (минимум 2 символа)</li>
                    )}
                    {!formData.birth_date && (
                      <li>• Дата рождения</li>
                    )}
                    {(!formData.iin || formData.iin.length !== 12) && (
                      <li>• ИИН (12 цифр)</li>
                    )}
                    {!formData.id_card_expiry && (
                      <li>• Срок действия удостоверения личности</li>
                    )}
                    {!formData.drivers_license_expiry && (
                      <li>• Срок действия водительского удостоверения</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Bottom submit button */}
              <div className="bg-white pt-4 pb-6">
                <Button
                  variant="secondary"
                  onClick={handleSubmit}
                  className={`w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 ${
                    !isFormValid ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={!isFormValid || isLoading}
                >
                  {isLoading ? <Loader color="#fff" /> : t("submit")}
                </Button>
              </div>
            </div>
          </div>
        </CustomPushScreen>,
        document.body
      )
    : null;
};
