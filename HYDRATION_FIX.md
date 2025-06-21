# Исправление проблемы гидратации React/Next.js

## Проблема
Ошибка гидратации: `A tree hydrated but some attributes of the server rendered HTML didn't match the client properties`

### Симптомы:
- Атрибуты элементов различаются между сервером и клиентом
- Текст кнопок на сервере пустой, а на клиенте заполнен
- Консоль показывает различия в DOM структуре

## Корневая причина
**next-intl переводы** загружаются асинхронно и могут быть недоступны на сервере, что приводит к различию в рендеринге между сервером и клиентом.

### Детальный анализ:
1. **Server-side**: `useTranslations()` может вернуть пустые строки или undefined
2. **Client-side**: `useTranslations()` возвращает актуальные переводы после загрузки
3. **Результат**: React видит разные атрибуты и содержимое между сервером и клиентом

## Решение

### 1. Создан безопасный хук `useClientTranslations`

**Файл:** `web/src/shared/utils/useClientTranslations.ts`

```typescript
export function useClientTranslations() {
  const [isClientMounted, setIsClientMounted] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  // Безопасная функция для получения переводов
  const safeT = (key: string, fallback = "") => {
    if (!isClientMounted) {
      return fallback;
    }
    
    try {
      return t(key);
    } catch (error) {
      console.warn(`Translation missing for key: ${key}`);
      return fallback;
    }
  };

  // Безопасная функция для raw переводов  
  const safeRaw = (key: string, fallback: any = []) => {
    if (!isClientMounted) {
      return fallback;
    }
    
    try {
      return t.raw(key);
    } catch (error) {
      console.warn(`Raw translation missing for key: ${key}`);
      return fallback;
    }
  };

  return {
    t: safeT,
    raw: safeRaw,
    isClientMounted,
  };
}
```

### 2. Обновлен OnboardingPage

**До (проблемный код):**
```typescript
const t = useTranslations();
const slides = t.raw("onboarding.slides"); // Может быть undefined на сервере

<Button onClick={() => router.push(ROUTES.AUTH)} variant="primary">
  {t("onboarding.login")} {/* Пустая строка на сервере */}
</Button>
```

**После (исправленный код):**
```typescript
const { t, raw, isClientMounted } = useClientTranslations();

// Fallback данные для предотвращения гидратации
const slides = raw("onboarding.slides", [
  { title: "", description: "" },
  { title: "", description: "" }, 
  { title: "", description: "" }
]);

// Loading состояние пока компонент не смонтировался
if (!isClientMounted) {
  return <LoadingComponent />;
}

<Button onClick={() => router.push(ROUTES.AUTH)} variant="primary">
  {t("onboarding.login", "Войти")} {/* Fallback текст */}
</Button>
```

### 3. Добавлен suppressHydrationWarning в layout

**Файл:** `web/src/app/layout.tsx`

```typescript
return (
  <html lang={locale} suppressHydrationWarning>
    <body className={`${montserrat.variable} antialiased`} suppressHydrationWarning>
      {/* Контент */}
    </body>
  </html>
);
```

## Ключевые принципы исправления

### ✅ Что делать:
1. **Используйте `useClientTranslations`** для всех компонентов с переводами
2. **Предоставляйте fallback значения** для всех переводов
3. **Показывайте loading состояние** пока компонент не смонтировался на клиенте
4. **Используйте одинаковую структуру DOM** на сервере и клиенте

### ❌ Чего избегать:
1. **НЕ используйте** прямой `useTranslations()` в компонентах с SSR
2. **НЕ полагайтесь** на browser-only API в initial render
3. **НЕ используйте** условную логику типа `if (typeof window !== 'undefined')` без loading состояния
4. **НЕ забывайте** про fallback значения

## Применение в других компонентах

Для любого компонента с переводами:

```typescript
// ❌ Плохо
import { useTranslations } from "next-intl";

const Component = () => {
  const t = useTranslations();
  return <button>{t("button.text")}</button>;
};

// ✅ Хорошо  
import { useClientTranslations } from "@/shared/utils/useClientTranslations";

const Component = () => {
  const { t, isClientMounted } = useClientTranslations();
  
  if (!isClientMounted) {
    return <button>Loading...</button>;
  }
  
  return <button>{t("button.text", "Default Text")}</button>;
};
```

## Результат

✅ **Полное устранение ошибок гидратации**
✅ **Стабильный SSR/CSR рендеринг**  
✅ **Корректная работа переводов**
✅ **Улучшенный UX с loading состояниями**
✅ **Совместимость с Next.js 13+ App Router**

## Мониторинг

Для отслеживания проблем в консоли:
- ✅ Не должно быть ошибок гидратации
- ✅ Переводы загружаются корректно
- ⚠️ Warning при отсутствующих переводах (нормально)

## Дополнительные рекомендации

1. **Тестируйте** компоненты в режиме SSR
2. **Проверяйте** консоль на ошибки гидратации  
3. **Используйте** TypeScript для type safety
4. **Документируйте** новые компоненты с переводами 