# Многоязычность (i18n) в AZV Webview

## Обзор

Приложение поддерживает три языка:
- **Русский** (ru) - язык по умолчанию
- **Английский** (en)
- **Казахский** (kz)

## Структура файлов

```
messages/
├── ru.json    # Русские переводы
├── en.json    # Английские переводы
└── kz.json    # Казахские переводы
```

## Конфигурация

### 1. Конфигурация i18n
Файл: `src/i18n/config.ts`
```typescript
export const locales = ["ru", "en", "kz"] as const;
export const defaultLocale: Locale = "ru";

export const localeNames = {
  ru: "Русский",
  en: "English", 
  kz: "Қазақша"
} as const;
```

### 2. Контекст языка
Файл: `src/shared/contexts/LanguageContext.tsx`

Предоставляет:
- `currentLocale` - текущий язык
- `setLocale(locale)` - функция смены языка
- `localeNames` - названия языков

## Использование

### 1. Базовые переводы
```tsx
import { useTranslations } from 'next-intl';

const MyComponent = () => {
  const t = useTranslations();
  
  return (
    <div>
      <h1>{t('main.drawer.menu.profile')}</h1>
      <p>{t('auth.phoneNumber.description')}</p>
    </div>
  );
};
```

### 2. Переводы enum'ов
```tsx
import { useTranslateEnum } from '@/shared/utils/translateEnum';

const MyComponent = () => {
  const { translateUserRole, translateRentalType } = useTranslateEnum();
  
  return (
    <div>
      <span>{translateUserRole('admin')}</span>
      <span>{translateRentalType('minutes')}</span>
    </div>
  );
};
```

### 3. Выбор языка
```tsx
import { LanguageSelector } from '@/shared/ui/language-selector';

const MyComponent = () => {
  return (
    <div>
      <LanguageSelector />
    </div>
  );
};
```

## Добавление новых переводов

### 1. Добавьте ключ во все файлы переводов

**ru.json:**
```json
{
  "newSection": {
    "title": "Новый заголовок",
    "description": "Новое описание"
  }
}
```

**en.json:**
```json
{
  "newSection": {
    "title": "New Title",
    "description": "New Description"
  }
}
```

**kz.json:**
```json
{
  "newSection": {
    "title": "Жаңа тақырып",
    "description": "Жаңа сипаттама"
  }
}
```

### 2. Используйте в компоненте
```tsx
const t = useTranslations('newSection');
return <h1>{t('title')}</h1>;
```

## Переведенные enum'ы

Все enum'ы из бэкенда переведены:

- `userRole` - роли пользователей
- `rentalType` - типы аренды
- `rentalStatus` - статусы аренды
- `carBodyType` - типы кузова
- `guarantorRequestStatus` - статусы заявок гаранта
- `verificationStatus` - статусы верификации
- `autoClass` - классы автомобилей
- `actionType` - типы действий
- `userPromoStatus` - статусы промокодов

## Компоненты

### LanguageSelector
Компонент выбора языка с выпадающим списком.

**Пропсы:**
- `className?: string` - дополнительные CSS классы

**Использование:**
```tsx
<LanguageSelector className="custom-class" />
```

## Технические детали

### Хранение выбранного языка
Язык сохраняется в cookie `NEXT_LOCALE` и автоматически восстанавливается при перезагрузке страницы.

### Обновление переводов
При смене языка страница автоматически перезагружается для применения новых переводов.

### TypeScript поддержка
Все переводы типизированы через `next-intl`, что обеспечивает автодополнение и проверку типов.

## Структура переводов

```json
{
  "error": "Общая ошибка",
  "auth": {
    "phoneNumber": { "title": "...", "description": "..." },
    "otp": { "title": "...", "description": "..." }
  },
  "main": {
    "drawer": {
      "menu": {
        "profile": "Профиль",
        "tripsAndPayments": "Поездки и штрафы"
      }
    }
  },
  "enums": {
    "userRole": { "admin": "Администратор", ... },
    "rentalType": { "minutes": "Поминутный", ... }
  }
}
```

## Рекомендации

1. **Используйте вложенную структуру** для группировки связанных переводов
2. **Добавляйте переводы во все языки одновременно**
3. **Используйте осмысленные ключи** вместо сокращений
4. **Проверяйте длину текста** - казахский текст может быть длиннее русского
5. **Тестируйте на всех языках** перед деплоем
