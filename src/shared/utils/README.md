# Error Translator

Утилита для перевода ошибок API на основе структуры ошибок из backend.

## Использование

### 1. Импорт и инициализация

```typescript
import { useErrorTranslator } from '@/shared/utils/errorTranslator';

function MyComponent() {
  const errorTranslator = useErrorTranslator();
  
  // Использование
  const handleError = (error: any) => {
    const translatedError = errorTranslator.translateApiError(error);
    console.log(translatedError); // Переведенная ошибка
  };
}
```

### 2. Прямое использование класса

```typescript
import { ErrorTranslator } from '@/shared/utils/errorTranslator';
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('profile.apiErrors');
  const errorTranslator = new ErrorTranslator(t);
  
  const handleError = (error: any) => {
    const translatedError = errorTranslator.translateApiError(error);
    // ...
  };
}
```

## Поддерживаемые типы ошибок

### Валидация данных
- **ИИН**: Только цифры, правильный формат
- **Даты**: Формат YYYY-MM-DD, валидные даты
- **Имена**: Длина от 1 до 50 символов
- **Телефон**: Только цифры
- **SMS код**: Валидность и срок действия

### Загрузка файлов
- **Тип файла**: Только JPEG и PNG
- **Количество файлов**: От 1 до 10
- **Размер файла**: Максимум 10MB

### Аренда автомобилей
- **Поиск автомобилей**: Наличие и доступность
- **Длительность**: Обязательность для почасовой/посуточной аренды
- **Статус аренды**: Активность, резервирование
- **Права доступа**: Владение автомобилем

### Механик
- **Проверки**: Активность, доступность
- **Фотографии**: Загрузка до/после проверки
- **Автомобили**: Поиск и доступность

### Общие ошибки
- **Сервер**: Внутренние ошибки
- **Баланс**: Недостаточно средств
- **Пользователь**: Не найден, неактивен

## Структура переводов

Переводы хранятся в файлах:
- `messages/ru.json` - Русский
- `messages/en.json` - Английский  
- `messages/kz.json` - Казахский

Структура:
```json
{
  "profile": {
    "apiErrors": {
      "validation": { ... },
      "fileUpload": { ... },
      "rental": { ... },
      "mechanic": { ... },
      "owner": { ... },
      "gps": { ... },
      "guarantor": { ... },
      "general": { ... }
    }
  }
}
```

## Добавление новых ошибок

1. Добавьте перевод в файлы `messages/*.json`
2. Обновите метод `translateApiError` в `ErrorTranslator`
3. Добавьте обработку в `translateValidationError` если нужно

## Примеры

### Ошибка валидации ИИН
```typescript
// Backend возвращает:
"ИИН должен содержать только цифры. Пример: 900515123456"

// ErrorTranslator переводит в:
"ИИН должен содержать только цифры. Пример: 900515123456" // RU
"IIN must contain only digits. Example: 900515123456" // EN
"ЖСН тек сандардан тұруы керек. Мысал: 900515123456" // KZ
```

### Ошибка загрузки файла
```typescript
// Backend возвращает:
"File document.jpg is not an image. Only JPEG and PNG are allowed."

// ErrorTranslator переводит в:
"Файл document.jpg не является изображением. Разрешены только JPEG и PNG." // RU
"File document.jpg is not an image. Only JPEG and PNG are allowed." // EN
"document.jpg файлы сурет емес. Тек JPEG және PNG рұқсат етілген." // KZ
```

### Ошибка аренды
```typescript
// Backend возвращает:
"Car not found or not available"

// ErrorTranslator переводит в:
"Автомобиль не найден или недоступен" // RU
"Car not found or not available" // EN
"Көлік табылмады немесе қолжетімді емес" // KZ
```
