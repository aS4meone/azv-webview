/**
 * Утилиты для валидации ИИН (Индивидуального Идентификационного Номера)
 * 
 * ИИН состоит из 12 цифр:
 * - Первые 6 цифр: дата рождения в формате ГГММДД
 * - 7-я цифра: определяет пол и век рождения
 * - Остальные 5 цифр: серийный номер
 */

/**
 * Определяет век и пол по 7-й цифре ИИН
 * @param seventhDigit - 7-я цифра ИИН
 * @returns объект с информацией о веке и полу, или null если цифра неверная
 */
export function getCenturyFromSeventhDigit(seventhDigit: number): { century: number; gender: 'male' | 'female' } | null {
  switch (seventhDigit) {
    case 1:
      return { century: 1800, gender: 'male' };
    case 2:
      return { century: 1800, gender: 'female' };
    case 3:
      return { century: 1900, gender: 'male' };
    case 4:
      return { century: 1900, gender: 'female' };
    case 5:
      return { century: 2000, gender: 'male' };
    case 6:
      return { century: 2000, gender: 'female' };
    default:
      return null;
  }
}

/**
 * Извлекает год рождения из первых 6 цифр ИИН
 * @param iin - ИИН (12 цифр)
 * @returns год рождения или null если формат неверный
 */
export function extractBirthYearFromIIN(iin: string): number | null {
  if (!/^\d{12}$/.test(iin)) {
    return null;
  }
  
  const yearPart = parseInt(iin.substring(0, 2), 10);
  const seventhDigit = parseInt(iin.charAt(6), 10);
  
  const centuryInfo = getCenturyFromSeventhDigit(seventhDigit);
  if (!centuryInfo) {
    return null;
  }
  
  return centuryInfo.century + yearPart;
}

/**
 * Определяет ожидаемый век по году рождения
 * @param birthYear - год рождения
 * @returns ожидаемые значения 7-й цифры для данного века
 */
function getExpectedSeventhDigitForYear(birthYear: number): number[] {
  if (birthYear >= 1800 && birthYear <= 1899) {
    return [1, 2]; // мужской и женский для 1800-х
  } else if (birthYear >= 1900 && birthYear <= 1999) {
    return [3, 4]; // мужской и женский для 1900-х
  } else if (birthYear >= 2000 && birthYear <= 2099) {
    return [5, 6]; // мужской и женский для 2000-х
  }
  return [];
}

/**
 * Извлекает полную дату рождения из ИИН
 * @param iin - ИИН (12 цифр)
 * @returns объект с датой рождения или null если формат неверный
 */
export function extractBirthDateFromIIN(iin: string): { year: number; month: number; day: number } | null {
  if (!/^\d{12}$/.test(iin)) {
    return null;
  }
  
  const seventhDigit = parseInt(iin.charAt(6), 10);
  const centuryInfo = getCenturyFromSeventhDigit(seventhDigit);
  if (!centuryInfo) {
    return null;
  }
  
  const yearPart = parseInt(iin.substring(0, 2), 10);
  const month = parseInt(iin.substring(2, 4), 10);
  const day = parseInt(iin.substring(4, 6), 10);
  
  const year = centuryInfo.century + yearPart;
  
  return { year, month, day };
}

/**
 * Валидирует соответствие полной даты рождения в ИИН
 * @param iin - ИИН (12 цифр)
 * @param birthYear - год рождения для проверки
 * @param birthMonth - месяц рождения для проверки (опционально)
 * @param birthDay - день рождения для проверки (опционально)
 * @returns true если соответствие корректное, false если нет
 */
export function validateIINBirthYearMatch(iin: string, birthYear: number, birthMonth?: number, birthDay?: number): boolean {
  // Проверяем формат ИИН
  if (!/^\d{12}$/.test(iin)) {
    return false;
  }
  
  const seventhDigit = parseInt(iin.charAt(6), 10);
  
  // Проверяем, что 7-я цифра корректная
  if (![1, 2, 3, 4, 5, 6].includes(seventhDigit)) {
    return false;
  }
  
  // Получаем ожидаемые значения 7-й цифры для данного года рождения
  const expectedSeventhDigits = getExpectedSeventhDigitForYear(birthYear);
  if (expectedSeventhDigits.length === 0) {
    return false; // Неподдерживаемый век
  }
  
  // Проверяем, соответствует ли 7-я цифра веку рождения
  if (!expectedSeventhDigits.includes(seventhDigit)) {
    return false;
  }
  
  // Извлекаем полную дату из ИИН
  const iinDate = extractBirthDateFromIIN(iin);
  if (!iinDate) {
    return false;
  }
  
  // Проверяем год
  if (iinDate.year !== birthYear) {
    return false;
  }
  
  // Проверяем месяц (если указан)
  if (birthMonth !== undefined && iinDate.month !== birthMonth) {
    return false;
  }
  
  // Проверяем день (если указан)
  if (birthDay !== undefined && iinDate.day !== birthDay) {
    return false;
  }
  
  return true;
}

/**
 * Валидирует полное соответствие ИИН дате рождения
 * @param iin - ИИН (12 цифр)
 * @param birthDate - дата рождения в формате YYYY-MM-DD или Date
 * @returns true если соответствие корректное, false если нет
 */
export function validateIINBirthDateMatch(iin: string, birthDate: string | Date): boolean {
  let birthYear: number;
  let birthMonth: number;
  let birthDay: number;
  
  if (typeof birthDate === 'string') {
    // Парсим дату в формате YYYY-MM-DD
    const date = new Date(birthDate);
    if (isNaN(date.getTime())) {
      return false;
    }
    birthYear = date.getFullYear();
    birthMonth = date.getMonth() + 1; // getMonth() возвращает 0-11
    birthDay = date.getDate();
  } else {
    birthYear = birthDate.getFullYear();
    birthMonth = birthDate.getMonth() + 1; // getMonth() возвращает 0-11
    birthDay = birthDate.getDate();
  }
  
  return validateIINBirthYearMatch(iin, birthYear, birthMonth, birthDay);
}

/**
 * Полная валидация ИИН с проверкой соответствия дате рождения
 * @param iin - ИИН для проверки
 * @param birthDate - дата рождения (опционально)
 * @returns объект с результатом валидации
 */
export function validateIIN(
  iin: string, 
  birthDate?: string | Date
): {
  isValid: boolean;
  errors: string[];
  birthYear?: number;
  gender?: 'male' | 'female';
  century?: number;
} {
  const errors: string[] = [];
  
  // Проверяем базовый формат
  if (!/^\d{12}$/.test(iin)) {
    errors.push('iinValidation.errors.invalidFormat');
    return { isValid: false, errors };
  }
  
  const seventhDigit = parseInt(iin.charAt(6), 10);
  
  // Проверяем 7-ю цифру
  if (![1, 2, 3, 4, 5, 6].includes(seventhDigit)) {
    errors.push('iinValidation.errors.invalidSeventhDigit');
    return { isValid: false, errors };
  }
  
  const centuryInfo = getCenturyFromSeventhDigit(seventhDigit);
  if (!centuryInfo) {
    errors.push('iinValidation.errors.invalidCenturyInfo');
    return { isValid: false, errors };
  }
  
  const yearPart = parseInt(iin.substring(0, 2), 10);
  const birthYear = centuryInfo.century + yearPart;
  
  // Если передан год рождения для проверки
  if (birthDate) {
    let expectedYear: number;
    
    if (typeof birthDate === 'string') {
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        errors.push('iinValidation.errors.invalidBirthDateFormat');
        return { isValid: false, errors };
      }
      expectedYear = date.getFullYear();
    } else {
      expectedYear = birthDate.getFullYear();
    }
    
    // Проверяем соответствие 7-й цифры веку рождения
    const expectedSeventhDigits = getExpectedSeventhDigitForYear(expectedYear);
    if (expectedSeventhDigits.length === 0) {
      errors.push('iinValidation.errors.unsupportedCentury');
      return { isValid: false, errors };
    }
    
    if (!expectedSeventhDigits.includes(seventhDigit)) {
      const expectedCentury = expectedYear >= 2000 ? 2000 : expectedYear >= 1900 ? 1900 : 1800;
      const expectedDigitRange = expectedSeventhDigits.join(' или ');
      errors.push(`iinValidation.errors.seventhDigitMismatch: 7-я цифра ИИН не соответствует веку рождения ${expectedYear}. Для ${expectedCentury}-х годов должна быть ${expectedDigitRange}, а не ${seventhDigit}`);
      return { isValid: false, errors };
    }
    
    // Дополнительная проверка полной даты из ИИН
    const iinDate = extractBirthDateFromIIN(iin);
    if (!iinDate) {
      errors.push('iinValidation.errors.invalidCenturyInfo');
      return { isValid: false, errors };
    }
    
    // Проверяем год
    if (iinDate.year !== expectedYear) {
      errors.push(`iinValidation.errors.birthYearMismatch: Год рождения в ИИН (${iinDate.year}) не соответствует указанной дате рождения (${expectedYear})`);
      return { isValid: false, errors };
    }
    
    // Проверяем месяц и день
    let expectedMonth: number;
    let expectedDay: number;
    
    if (typeof birthDate === 'string') {
      const date = new Date(birthDate);
      expectedMonth = date.getMonth() + 1;
      expectedDay = date.getDate();
    } else {
      expectedMonth = birthDate.getMonth() + 1;
      expectedDay = birthDate.getDate();
    }
    
    if (iinDate.month !== expectedMonth || iinDate.day !== expectedDay) {
      const iinDateStr = `${iinDate.day.toString().padStart(2, '0')}.${iinDate.month.toString().padStart(2, '0')}.${iinDate.year}`;
      const expectedDateStr = `${expectedDay.toString().padStart(2, '0')}.${expectedMonth.toString().padStart(2, '0')}.${expectedYear}`;
      errors.push(`iinValidation.errors.birthDateMismatch: Дата рождения в ИИН (${iinDateStr}) не соответствует указанной дате рождения (${expectedDateStr})`);
      return { isValid: false, errors };
    }
  }
  
  return {
    isValid: true,
    errors: [],
    birthYear,
    gender: centuryInfo.gender,
    century: centuryInfo.century
  };
}