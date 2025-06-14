import { useEffect } from "react";

/**
 * 🔒 React Hook для инициализации браузерной защиты
 */
export const useBrowserProtection = () => {
  useEffect(() => {
    // Проверяем, что мы на клиенте (не SSR)
    if (typeof window === "undefined") return;

    console.log("🔒 Инициализация защиты браузера в Next.js...");

    // Динамически импортируем и инициализируем защиту
    const initProtection = async () => {
      try {
        const { BrowserProtection } = await import(
          "../utils/browser-protection"
        );
        BrowserProtection.init();
        console.log("✅ Браузерная защита активирована");
      } catch (error) {
        console.error("❌ Ошибка инициализации защиты:", error);
      }
    };

    initProtection();

    // Дополнительная защита для Next.js
    const addNextJSProtection = () => {
      // Отключаем Right-click
      document.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        return false;
      });

      // Отключаем текстовое выделение
      document.addEventListener("selectstart", (e) => {
        const target = e.target as HTMLElement;
        const isEditable =
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.contentEditable === "true";

        if (!isEditable) {
          e.preventDefault();
          return false;
        }
      });

      // Отключаем копирование через клавиатуру
      document.addEventListener("keydown", (e) => {
        const isCtrl = e.ctrlKey || e.metaKey;

        if (isCtrl && ["c", "v", "a", "x", "s"].includes(e.key.toLowerCase())) {
          const target = e.target as HTMLElement;
          const isEditable =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.contentEditable === "true";

          if (!isEditable) {
            e.preventDefault();
            return false;
          }
        }

        // Блокируем F12, Ctrl+Shift+I
        if (
          e.key === "F12" ||
          (isCtrl && e.shiftKey && e.key === "I") ||
          (isCtrl && e.key === "U")
        ) {
          e.preventDefault();
          return false;
        }
      });

      // Отключаем зум
      document.addEventListener(
        "wheel",
        (e) => {
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
          }
          // Обычный скролл колесом разрешаем
        },
        { passive: false }
      );

      // Мобильные жесты - только блокируем pinch-to-zoom
      document.addEventListener(
        "touchstart",
        (e) => {
          if (e.touches.length === 2) {
            e.preventDefault(); // Блокируем pinch-to-zoom
          }
          // Одиночные касания (скролл) разрешаем
        },
        { passive: false }
      );

      document.addEventListener(
        "touchmove",
        (e) => {
          if (e.touches.length === 2) {
            e.preventDefault(); // Блокируем pinch-to-zoom
          }
          // Одиночные касания (скролл) разрешаем
        },
        { passive: false }
      );

      // Double-tap zoom
      let lastTouchEnd = 0;
      let lastTouchCount = 0;

      document.addEventListener(
        "touchend",
        (e) => {
          const now = Date.now();
          const touchCount = e.changedTouches.length;

          // Блокируем только double-tap с одним пальцем
          if (
            touchCount === 1 &&
            lastTouchCount === 1 &&
            now - lastTouchEnd <= 300
          ) {
            e.preventDefault(); // Блокируем double-tap zoom
          }

          lastTouchEnd = now;
          lastTouchCount = touchCount;
        },
        { passive: false }
      );
    };

    // Добавляем дополнительную защиту
    addNextJSProtection();

    // Cleanup при размонтировании компонента
    return () => {
      console.log("🔒 Очистка браузерной защиты");
    };
  }, []);
};
