import { useTranslations } from 'next-intl';

/**
 * Хук для перевода enum значений
 */
export const useTranslateEnum = () => {
  const t = useTranslations('enums');

  const translateUserRole = (role: string) => {
    return t(`userRole.${role.toLowerCase()}`);
  };

  const translateRentalType = (type: string) => {
    return t(`rentalType.${type.toLowerCase()}`);
  };

  const translateRentalStatus = (status: string) => {
    return t(`rentalStatus.${status.toLowerCase()}`);
  };

  const translateCarBodyType = (bodyType: string) => {
    return t(`carBodyType.${bodyType.toLowerCase()}`);
  };

  const translateGuarantorRequestStatus = (status: string) => {
    return t(`guarantorRequestStatus.${status.toLowerCase()}`);
  };

  const translateVerificationStatus = (status: string) => {
    return t(`verificationStatus.${status.toLowerCase()}`);
  };

  const translateAutoClass = (autoClass: string) => {
    return t(`autoClass.${autoClass}`);
  };

  const translateActionType = (actionType: string) => {
    return t(`actionType.${actionType.toLowerCase()}`);
  };

  const translateUserPromoStatus = (status: string) => {
    return t(`userPromoStatus.${status.toLowerCase()}`);
  };

  return {
    translateUserRole,
    translateRentalType,
    translateRentalStatus,
    translateCarBodyType,
    translateGuarantorRequestStatus,
    translateVerificationStatus,
    translateAutoClass,
    translateActionType,
    translateUserPromoStatus,
  };
};
