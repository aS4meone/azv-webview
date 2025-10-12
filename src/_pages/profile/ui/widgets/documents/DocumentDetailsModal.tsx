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
  "id_front" | "id_back" | "drivers_license" | "selfie" | "selfie_with_license" | "psych_neurology_certificate" | "narcology_certificate" | "pension_contributions_certificate"
> & {
  first_name?: string;
  last_name?: string;
  document_type?: 'iin' | 'passport';
  is_rk_citizen?: boolean;
};

interface CertificateFiles {
  psych_neurology_certificate?: File | null;
  narcology_certificate?: File | null;
  pension_contributions_certificate?: File | null;
}

interface DocumentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DocumentDetailsData, files?: CertificateFiles) => void;
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
      is_rk_citizen: false,
      email: "",
      // Не загружаем даты истечения документов при инициализации
      id_card_expiry: "",
      drivers_license_expiry: "",
    };
  });
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [certificateFiles, setCertificateFiles] = React.useState<CertificateFiles>({
    psych_neurology_certificate: null,
    narcology_certificate: null,
    pension_contributions_certificate: null,
  });
  const [guideModalOpen, setGuideModalOpen] = React.useState<number | null>(null);
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
      email: (user as any).email || "",
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

  const validateEmail = (email: string) => {
    if (!email.trim()) return t("validation.emailRequired");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return t("validation.emailInvalid");
    return "";
  };

  const handleFileChange = (field: keyof CertificateFiles, file: File | null) => {
    setCertificateFiles(prev => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Combine first_name and last_name into full_name for backend
    const submitData = {
      ...formData,
      full_name: `${formData.first_name || ""} ${formData.last_name || ""}`.trim(),
    };
    onSubmit(submitData, certificateFiles);
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

    // Validate email
    if (name === "email") {
      const emailError = validateEmail(value);
      if (emailError) {
        newErrors.email = emailError;
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
    const hasEmail = !!formData.email && validateEmail(formData.email) === "";

    const isValid = (
      hasFirstName &&
      hasLastName &&
      hasBirthDate &&
      hasDocumentId &&
      hasIdExpiry &&
      hasLicenseExpiry &&
      hasEmail
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
      hasEmail,
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

  const GuideModal = ({ certificateNumber }: { certificateNumber: number }) => {
    const guides = [
      {
        title: t("psychNeurologyCertificate"),
        steps: t("psychNeurologyGuide").split("⇒"),
        app: "Kaspi",
      },
      {
        title: t("narcologyCertificate"),
        steps: t("narcologyGuide").split("⇒"),
        app: "Kaspi",
      },
      {
        title: t("pensionContributionsCertificate"),
        steps: t("pensionGuide").split("⇒"),
        app: "Kaspi",
      },
    ];

    const guide = guides[certificateNumber - 1];
    if (!guide) return null;

    return createPortal(
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9999] flex items-end animate-fadeIn"
        onClick={() => setGuideModalOpen(null)}
      >
        <div 
          className="bg-white rounded-t-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
            {/* Handle bar */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{guide.title}</h3>
              <button
                onClick={() => setGuideModalOpen(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                {guide.app}
              </div>
            </div>
          </div>
          
          <div className="p-6 pb-8">
            <div className="space-y-4">
              {guide.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#191919] text-white flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-gray-800 leading-relaxed">{step.trim()}</p>
                  </div>
                </div>
              ))}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>{t("note")}:</strong> {t("saveToFiles")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  return isOpen && typeof window !== "undefined"
    ? createPortal(
        <>
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
                        placeholder={t("selectBirthDate")}
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
                      placeholder={t("selectExpiryDate")}
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
                      placeholder={t("selectExpiryDate")}
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

              {/* Email Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <h3 className="text-lg font-semibold text-[#191919] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#191919] flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-[#191919]">{t("emailSection")}</div>
                    <div className="text-sm text-[#666666]">{t("emailDescription")}</div>
                  </div>
                </h3>
                <Input
                  label={t("email")}
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  required
                  error={errors.email}
                  placeholder={t("emailPlaceholder")}
                  showClearButton={!!formData.email}
                  onClear={() => handleClearField("email")}
                />
              </div>

              {/* RK Citizenship Section */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                <h3 className="text-lg font-semibold text-[#191919] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#191919] flex items-center justify-center shadow-md">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-[#191919]">{t("citizenshipSection")}</div>
                    <div className="text-sm text-[#191919]">{t("citizenshipDescription")}</div>
                  </div>
                </h3>
                
                <label className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200">
                  <input
                    type="checkbox"
                    checked={formData.is_rk_citizen || false}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        is_rk_citizen: e.target.checked,
                      }));
                    }}
                    className="w-5 h-5 text-[#191919] border-gray-300 rounded focus:ring-[#191919]"
                  />
                  <span className="text-base font-medium text-gray-700">{t("isRkCitizen")}</span>
                </label>
                
                {formData.is_rk_citizen && (
                  <div className="mt-6 space-y-3">
                    <div className="flex items-start gap-2 p-4 bg-gray-100 border-l-4 border-gray-700 rounded-r-lg">
                      <svg className="w-5 h-5 text-gray-700 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-gray-800">
                        {t("rkCitizenInfo")}
                      </p>
                    </div>
                    
                    {/* Certificate 1: Psychoneurology */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-400 transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
                            1
                          </div>
                          <span className="text-sm font-medium text-gray-800">{t("psychNeurologyCertificate")}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGuideModalOpen(1)}
                          className="w-7 h-7 rounded-lg bg-gray-700 text-white flex items-center justify-center hover:bg-[#191919] transition-colors shadow-sm"
                          title={t("howToGet")}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      
                      {!certificateFiles.psych_neurology_certificate ? (
                        <label className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-all">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm font-medium text-gray-600">{t("uploadDocument") || "Выберите файл"}</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('psych_neurology_certificate', e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-300 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-800 truncate">{certificateFiles.psych_neurology_certificate.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFileChange('psych_neurology_certificate', null)}
                            className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Certificate 2: Narcology */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-400 transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
                            2
                          </div>
                          <span className="text-sm font-medium text-gray-800">{t("narcologyCertificate")}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGuideModalOpen(2)}
                          className="w-7 h-7 rounded-lg bg-gray-700 text-white flex items-center justify-center hover:bg-[#191919] transition-colors shadow-sm"
                          title={t("howToGet")}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      
                      {!certificateFiles.narcology_certificate ? (
                        <label className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-all">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm font-medium text-gray-600">{t("uploadDocument") || "Выберите файл"}</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('narcology_certificate', e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-300 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-800 truncate">{certificateFiles.narcology_certificate.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFileChange('narcology_certificate', null)}
                            className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Certificate 3: Pension Contributions */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:border-gray-400 transition-all duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-700 font-semibold text-sm">
                            3
                          </div>
                          <span className="text-sm font-medium text-gray-800">{t("pensionContributionsCertificate")}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setGuideModalOpen(3)}
                          className="w-7 h-7 rounded-lg bg-gray-700 text-white flex items-center justify-center hover:bg-[#191919] transition-colors shadow-sm"
                          title={t("howToGet")}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </div>
                      
                      {!certificateFiles.pension_contributions_certificate ? (
                        <label className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-500 hover:bg-gray-50 transition-all">
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm font-medium text-gray-600">{t("uploadDocument") || "Выберите файл"}</span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileChange('pension_contributions_certificate', e.target.files?.[0] || null)}
                            className="hidden"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-gray-100 border border-gray-300 rounded-lg">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <svg className="w-5 h-5 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm text-gray-800 truncate">{certificateFiles.pension_contributions_certificate.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFileChange('pension_contributions_certificate', null)}
                            className="ml-2 p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>

              {/* Debug information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-800 mb-2">{t("debugInfo")}</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>{t("firstName")} "{formData.first_name}" {t("length")} {formData.first_name?.length || 0})</div>
                  <div>{t("lastName")} "{formData.last_name}" {t("length")} {formData.last_name?.length || 0})</div>
                  <div>{t("birthDate")} "{formData.birth_date}"</div>
                  <div>{t("iin")} "{formData.iin}" {t("length")} {formData.iin?.length || 0})</div>
                  <div>{t("idCardExpiry")} "{formData.id_card_expiry}"</div>
                  <div>{t("driversLicenseExpiry")} "{formData.drivers_license_expiry}"</div>
                  <div className="mt-2 font-semibold">Validation: {isFormValid ? t("valid") : t("invalid")}</div>
                </div>
              </div>

              {!isFormValid && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-semibold text-red-800 mb-2">{t("missingFields")}</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {(!formData.first_name || formData.first_name.trim().length < 2) && (
                      <li>{t("firstNameRequired")}</li>
                    )}
                    {(!formData.last_name || formData.last_name.trim().length < 2) && (
                      <li>{t("lastNameRequired")}</li>
                    )}
                    {!formData.birth_date && (
                      <li>{t("birthDateRequired")}</li>
                    )}
                    {(!formData.iin || formData.iin.length !== 12) && (
                      <li>{t("iinRequired")}</li>
                    )}
                    {!formData.id_card_expiry && (
                      <li>{t("idCardExpiryRequired")}</li>
                    )}
                    {!formData.drivers_license_expiry && (
                      <li>{t("driversLicenseExpiryRequired")}</li>
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
        </CustomPushScreen>
        {guideModalOpen && <GuideModal certificateNumber={guideModalOpen} />}
        </>,
        document.body
      )
    : null;
};
