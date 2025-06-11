# PhotoUploadContext - Контекст управления загрузкой фотографий

Контекст для управления состоянием загрузки фотографий с автоматической проверкой через localStorage.

## Основные возможности

- ✅ Автоматическая проверка статуса загрузки через localStorage
- ✅ Конфигурации по умолчанию для разных типов фотографий
- ✅ Возможность регистрации пользовательских конфигураций
- ✅ Автоматическое скрытие интерфейса после загрузки
- ✅ Поддержка разных ролей (пользователь, владелец, механик)
- ✅ Поддержка статусов "до" и "после"

## Логика работы

Контекст проверяет значение в localStorage:
- `false` - фото не загружено → **показывать интерфейс загрузки**
- `true` - фото загружено → **не показывать**
- `null` - не инициализировано → **не показывать**

## Быстрый старт

### 1. Подключение провайдера

```tsx
import { PhotoUploadProvider } from '@/shared/contexts/PhotoUploadContext';

function App() {
  return (
    <PhotoUploadProvider>
      {/* Ваше приложение */}
    </PhotoUploadProvider>
  );
}
```

### 2. Использование с хуком

```tsx
import { useAutoPhotoUpload } from '@/shared/hooks/useAutoPhotoUpload';
import { AutoPhotoUpload } from '@/widgets/upload-photo/AutoPhotoUpload';
import { PhotoActions, PhotoStatus } from '@/shared/contexts/PhotoUploadContext';

function MyComponent() {
  const { startPhotoUpload, autoUploadProps, needsUpload } = useAutoPhotoUpload({
    action: PhotoActions.userupload,
    status: PhotoStatus.before,
  });

  return (
    <div>
      {needsUpload && (
        <Button onClick={startPhotoUpload}>
          Загрузить фото
        </Button>
      )}
      
      <AutoPhotoUpload {...autoUploadProps} />
    </div>
  );
}
```

### 3. Прямое использование контекста

```tsx
import { usePhotoUpload, PhotoActions, PhotoStatus } from '@/shared/contexts/PhotoUploadContext';

function MyComponent() {
  const { shouldShowUpload, initPhotoCheck } = usePhotoUpload();
  
  const needsUpload = shouldShowUpload(PhotoActions.userupload, PhotoStatus.before);
  
  const handleStartUpload = () => {
    initPhotoCheck(PhotoActions.userupload, PhotoStatus.before);
    // Открыть модальное окно
  };

  return needsUpload ? (
    <Button onClick={handleStartUpload}>Загрузить фото</Button>
  ) : null;
}
```

## Пользовательские конфигурации

```tsx
import { useAutoPhotoUpload } from '@/shared/hooks/useAutoPhotoUpload';
import { PhotoActions, PhotoStatus } from '@/shared/contexts/PhotoUploadContext';

function CustomUploadComponent() {
  const customConfig = {
    action: PhotoActions.userupload,
    status: PhotoStatus.before,
    config: [
      {
        id: 'custom_vehicle_photos',
        title: 'Фото автомобиля со всех сторон',
        multiple: { min: 4, max: 8 }
      },
      {
        id: 'damage_photos',
        title: 'Фото повреждений крупным планом',
        multiple: { min: 1, max: 10 }
      }
    ],
    onPhotoUpload: async (files) => {
      // Ваша логика загрузки на сервер
      console.log('Загружаем файлы:', files);
      
      try {
        await uploadToServer(files);
        // Автоматически отметится как загруженное
      } catch (error) {
        console.error('Ошибка загрузки:', error);
      }
    }
  };

  const { startPhotoUpload, autoUploadProps } = useAutoPhotoUpload({
    action: PhotoActions.userupload,
    status: PhotoStatus.before,
    customConfig
  });

  return (
    <div>
      <Button onClick={startPhotoUpload}>
        Загрузить фото автомобиля
      </Button>
      
      <AutoPhotoUpload {...autoUploadProps} />
    </div>
  );
}
```

## API

### PhotoActions (enum)

- `userupload` - Загрузка пользователем
- `ownerupload` - Загрузка владельцем
- `mechanic_checkup` - Загрузка при осмотре механиком
- `mechanic_delivery` - Загрузка при передаче механиком

### PhotoStatus (enum)

- `before` - До работ
- `after` - После работ

### usePhotoUpload Hook

```tsx
const {
  shouldShowUpload,      // (action, status) => boolean
  markPhotoAsUploaded,   // (action, status) => void
  initPhotoCheck,        // (action, status) => void
  getPhotoConfig,        // (action, status) => PhotoConfig[] | null
  getUploadHandler,      // (action, status) => function | null
  registerPhotoUpload,   // (config) => void
} = usePhotoUpload();
```

### useAutoPhotoUpload Hook

```tsx
const {
  isOpen,              // boolean - состояние модального окна
  needsUpload,         // boolean - нужно ли показывать кнопку загрузки
  config,              // PhotoConfig[] - конфигурация фотографий
  startPhotoUpload,    // () => void - начать процесс загрузки
  handleClose,         // () => void - закрыть модальное окно
  uploadHandler,       // (files) => void - обработчик загрузки
  markAsUploaded,      // () => void - отметить как загруженное
  autoUploadProps,     // props для AutoPhotoUpload компонента
} = useAutoPhotoUpload({ action, status, customConfig? });
```

## Конфигурации по умолчанию

### Пользователь (userupload)
- Общий вид автомобиля
- Повреждения (1-5 фото)

### Владелец (ownerupload)
- Фото владельца с автомобилем (селфи)
- Документы на автомобиль (1-3 фото)

### Механик - осмотр (mechanic_checkup)
- Осмотр автомобиля (3-10 фото)
- Состояние двигателя

### Механик - передача (mechanic_delivery)
- Состояние при передаче (2-8 фото)

## Примеры использования

### Простая кнопка загрузки

```tsx
function UploadButton() {
  const { needsUpload, startPhotoUpload, autoUploadProps } = useAutoPhotoUpload({
    action: PhotoActions.userupload,
    status: PhotoStatus.before,
  });

  if (!needsUpload) return null;

  return (
    <>
      <Button onClick={startPhotoUpload}>
        Загрузить фото автомобиля
      </Button>
      <AutoPhotoUpload {...autoUploadProps} />
    </>
  );
}
```

### Проверка всех статусов

```tsx
function StatusChecker() {
  const { shouldShowUpload } = usePhotoUpload();
  
  const allStatuses = [
    { action: PhotoActions.userupload, status: PhotoStatus.before },
    { action: PhotoActions.userupload, status: PhotoStatus.after },
    // ... другие статусы
  ];

  return (
    <div>
      {allStatuses.map(({ action, status }) => (
        <div key={`${action}_${status}`}>
          {action} {status}: {shouldShowUpload(action, status) ? 'Нужно загрузить' : 'Загружено'}
        </div>
      ))}
    </div>
  );
}
``` 