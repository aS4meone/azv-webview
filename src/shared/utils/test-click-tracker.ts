// Тестовый файл для проверки работы click-tracker
import { clickTracker } from "./click-tracker";

export async function testClickTracker() {
  console.log("🧪 Тестирование click-tracker...");

  // 1. Проверяем подключение к серверу
  console.log("1. Проверка подключения к серверу...");
  const isConnected = await clickTracker.testConnection();

  if (!isConnected) {
    console.error("❌ Сервер недоступен!");
    return false;
  }

  console.log("✅ Сервер доступен!");

  // 2. Отправляем тестовый клик
  console.log("2. Отправка тестового клика...");
  await clickTracker.sendTestClick();

  // 3. Тестовая диагностика
  console.log("3. Отправка тестовой диагностики...");
  const testDiagnosticData = {
    fixedElementsCount: 5,
    pointerEventsFixed: 3,
    cssIssuesFound: 2,
    elementFromPoint: {
      tagName: "button",
      id: "test-button",
    },
    cssIssues: {
      pointerEvents: ["button#test"],
      zIndex: ["div.overlay"],
    },
    viewport: {
      status: "correct",
      content: "width=device-width, initial-scale=1",
    },
    webviewSettings: {
      useHybridComposition: true,
      supportZoom: false,
    },
  };

  await clickTracker.trackDiagnosis(testDiagnosticData);

  console.log("✅ Тестирование завершено!");
  return true;
}

// Автоматически запускаем тест если это WebView
if (typeof window !== "undefined") {
  // Запускаем тест через 3 секунды после загрузки
  setTimeout(() => {
    testClickTracker().then((success) => {
      if (success) {
        console.log("🎉 Click tracker готов к работе!");
      } else {
        console.error("💥 Проблемы с click tracker!");
      }
    });
  }, 3000);

  // Добавляем в глобальный объект для ручного тестирования
  (window as any).testClickTracker = testClickTracker;
}
