import { useTranslations } from 'next-intl';

/**
 * Утилита для перевода ошибок API на основе структуры ошибок из backend
 */
export class ErrorTranslator {
  private t: (key: string, params?: Record<string, any>) => string;

  constructor(t: (key: string, params?: Record<string, any>) => string) {
    this.t = t;
  }

  /**
   * Переводит ошибку API в понятное сообщение для пользователя
   */
  translateApiError(error: any): string {
    if (!error) return this.t('apiErrors.general.internalServerError');

    // Если ошибка уже переведена
    if (typeof error === 'string') {
      return error;
    }

    // Если это объект с detail
    const detail = error.detail || error.message || error.error;
    if (!detail) {
      return this.t('apiErrors.general.internalServerError');
    }

    // Обработка ошибок валидации Pydantic
    if (detail.includes('Validation error:')) {
      return this.translateValidationError(detail);
    }

    // Обработка ошибок загрузки файлов
    if (detail.includes('is not an image') || detail.includes('JPEG') || detail.includes('PNG')) {
      const filename = this.extractFilename(detail);
      return this.t('apiErrors.fileUpload.invalidFileType', { filename });
    }

    if (detail.includes('You must provide between')) {
      const match = detail.match(/between (\d+) and (\d+) files for '(.+)'/);
      if (match) {
        return this.t('apiErrors.fileUpload.photoCountInvalid', {
          min: match[1],
          max: match[2],
          field_name: match[3]
        });
      }
    }

    if (detail.includes('is not JPEG or PNG')) {
      const filename = this.extractFilename(detail);
      const fieldName = this.extractFieldName(detail);
      return this.t('apiErrors.fileUpload.photoTypeInvalid', { 
        filename, 
        field_name: fieldName 
      });
    }

    // Обработка ошибок аренды
    if (detail.includes('Rental history not found')) {
      return this.t('apiErrors.rental.rentalNotFound');
    }

    if (detail.includes('Car not found or not available')) {
      return this.t('apiErrors.rental.carNotFound');
    }

    if (detail.includes('Машина не найдена или не доступна')) {
      return this.t('apiErrors.rental.carNotAvailable');
    }

    if (detail.includes('Duration обязателен для аренды по часам')) {
      return this.t('apiErrors.rental.durationRequiredHours');
    }

    if (detail.includes('Duration обязателен для посуточной аренды')) {
      return this.t('apiErrors.rental.durationRequiredDays');
    }

    if (detail.includes('Нет активной брони для отмены')) {
      return this.t('apiErrors.rental.noActiveRental');
    }

    if (detail.includes('Нет активного заказа доставки для отмены')) {
      return this.t('apiErrors.rental.noActiveDelivery');
    }

    if (detail.includes('Автомобиль не найден')) {
      return this.t('apiErrors.rental.carNotFoundDelivery');
    }

    if (detail.includes('Rental is not in reserved status')) {
      return this.t('apiErrors.rental.rentalNotReserved');
    }

    if (detail.includes('Not your car')) {
      return this.t('apiErrors.rental.notYourCar');
    }

    if (detail.includes('Бронирование не найдено или уже отменено')) {
      return this.t('apiErrors.rental.bookingNotFound');
    }

    // Обработка ошибок механика
    if (detail.includes('Ошибка при получении данных об автомобилях')) {
      return this.t('apiErrors.mechanic.carsDataError', { error: this.extractError(detail) });
    }

    if (detail.includes('Ошибка поиска авто')) {
      return this.t('apiErrors.mechanic.searchError', { error: this.extractError(detail) });
    }

    if (detail.includes('Автомобиль не найден или недоступен для проверки')) {
      return this.t('apiErrors.mechanic.carNotAvailable');
    }

    if (detail.includes('Нет активной проверки для старта')) {
      return this.t('apiErrors.mechanic.noActiveInspection');
    }

    if (detail.includes('Нет активной проверки (IN_USE)')) {
      return this.t('apiErrors.mechanic.noActiveInspectionInUse');
    }

    if (detail.includes('Ошибка при загрузке фотографий до проверки')) {
      return this.t('apiErrors.mechanic.photoUploadBeforeError');
    }

    if (detail.includes('Ошибка при загрузке фотографий после проверки')) {
      return this.t('apiErrors.mechanic.photoUploadAfterError');
    }

    if (detail.includes('Нет активной проверки для завершения')) {
      return this.t('apiErrors.mechanic.noActiveInspectionComplete');
    }

    // Обработка ошибок владельца
    if (detail.includes('Месяц должен быть от 1 до 12')) {
      return this.t('apiErrors.owner.invalidMonth');
    }

    // Обработка ошибок GPS
    if (detail.includes('Error fetching vehicles data')) {
      return this.t('apiErrors.gps.vehiclesDataError', { error: this.extractError(detail) });
    }

    if (detail.includes('Вы ещё не арендовали ни одной машины')) {
      return this.t('apiErrors.gps.noRentals');
    }

    if (detail.includes('Все часто используемые вами машины сейчас заняты')) {
      return this.t('apiErrors.gps.allCarsBusy');
    }

    // Обработка ошибок гаранта
    if (detail.includes('Пользователь не найден')) {
      return this.t('apiErrors.guarantor.userNotFound');
    }

    // Обработка общих ошибок
    if (detail.includes('Internal Server Error')) {
      return this.t('apiErrors.general.internalServerError');
    }

    if (detail.includes('Пожалуйста, пополните счёт')) {
      const amount = this.extractAmount(detail);
      return this.t('apiErrors.general.insufficientBalance', { amount });
    }

    // Если ошибка не распознана, возвращаем оригинальное сообщение
    return detail;
  }

  /**
   * Переводит ошибки валидации Pydantic
   */
  private translateValidationError(detail: string): string {
    // ИИН должен содержать только цифры
    if (detail.includes('ИИН должен содержать только цифры')) {
      return this.t('apiErrors.validation.iinDigitsOnly');
    }

    // Формат даты
    if (detail.includes('Дата должна быть в формате YYYY-MM-DD')) {
      return this.t('apiErrors.validation.dateFormat');
    }

    // Дата рождения в будущем
    if (detail.includes('Дата рождения не может быть в будущем')) {
      return this.t('apiErrors.validation.birthDateFuture');
    }

    // Слишком старая дата рождения
    if (detail.includes('Некорректная дата рождения. Год должен быть больше 1900')) {
      return this.t('apiErrors.validation.birthDateTooOld');
    }

    // Возраст менее 18 лет
    if (detail.includes('Возраст должен быть не менее 18 лет')) {
      return this.t('apiErrors.validation.ageRequirement');
    }

    // Дата истечения в прошлом
    if (detail.includes('Дата окончания документа должна быть в будущем')) {
      return this.t('apiErrors.validation.expiryDatePast');
    }

    // Длина имени/фамилии
    if (detail.includes('first_name must be 1..50 chars')) {
      return this.t('apiErrors.validation.firstNameLength');
    }

    if (detail.includes('last_name must be 1..50 chars')) {
      return this.t('apiErrors.validation.lastNameLength');
    }

    // Телефон только цифры
    if (detail.includes('Phone number must contain only digits')) {
      return this.t('apiErrors.validation.phoneDigitsOnly');
    }

    // SMS код
    if (detail.includes('Invalid SMS code or code expired')) {
      return this.t('apiErrors.validation.smsCodeInvalid');
    }

    // Пользователь не найден
    if (detail.includes('User not found or inactive')) {
      return this.t('apiErrors.validation.userNotFound');
    }

    // Неверные учетные данные
    if (detail.includes('Could not validate credentials')) {
      return this.t('apiErrors.validation.credentialsInvalid');
    }

    // Нечего обновлять
    if (detail.includes('Nothing to update')) {
      return this.t('apiErrors.validation.nothingToUpdate');
    }

    // Ошибка обновления профиля
    if (detail.includes('Failed to update profile')) {
      return this.t('apiErrors.validation.profileUpdateFailed');
    }

    // Неподдерживаемая локаль
    if (detail.includes('Unsupported locale')) {
      return this.t('apiErrors.validation.unsupportedLocale');
    }

    // Если не удалось распознать, возвращаем оригинальное сообщение
    return detail;
  }

  /**
   * Извлекает имя файла из сообщения об ошибке
   */
  private extractFilename(detail: string): string {
    const match = detail.match(/File (.+?) is/);
    return match ? match[1] : 'файл';
  }

  /**
   * Извлекает имя поля из сообщения об ошибке
   */
  private extractFieldName(detail: string): string {
    const match = detail.match(/in '(.+?)'/);
    return match ? match[1] : 'поле';
  }

  /**
   * Извлекает текст ошибки из сообщения
   */
  private extractError(detail: string): string {
    const match = detail.match(/: (.+)$/);
    return match ? match[1] : detail;
  }

  /**
   * Извлекает сумму из сообщения об ошибке
   */
  private extractAmount(detail: string): string {
    const match = detail.match(/минимум (\d+)₸/);
    return match ? match[1] : '0';
  }
}

/**
 * Хук для использования переводчика ошибок
 */
export function useErrorTranslator() {
  const t = useTranslations('profile.apiErrors');
  return new ErrorTranslator(t);
}


