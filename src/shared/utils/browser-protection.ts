/**
 * 🔒 Утилита для отключения браузерных функций
 */

// Интерфейс для vendor-specific CSS свойств
interface ExtendedCSSStyleDeclaration extends CSSStyleDeclaration {
  mozUserSelect?: string;
  msUserSelect?: string;
  webkitTouchCallout?: string;
}

export class BrowserProtection {
  private static isInitialized = false;

  /**
   * Инициализирует защиту от браузерных функций
   */
  static init(): void {
    if (this.isInitialized) return;

    console.log("🔒 Инициализация защиты браузера...");

    this.disableTextSelection();
    this.disableContextMenu();
    this.disableKeyboardShortcuts();
    this.disableZoom();
    this.disableDragDrop();
    this.disableImageSaving();
    this.disableDevTools();

    this.isInitialized = true;
    console.log("✅ Защита браузера активна");
  }

  /**
   * Отключает выделение текста
   */
  private static disableTextSelection(): void {
    // CSS стили
    const style = document.createElement("style");
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -webkit-touch-callout: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      input, textarea, [contenteditable="true"] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
    `;
    document.head.appendChild(style);

    // JavaScript события
    document.addEventListener("selectstart", (e) => {
      const target = e.target as HTMLElement;
      if (!this.isEditableElement(target)) {
        e.preventDefault();
        return false;
      }
    });
  }

  /**
   * Отключает контекстное меню
   */
  private static disableContextMenu(): void {
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      return false;
    });
  }

  /**
   * Отключает клавиатурные сочетания
   */
  private static disableKeyboardShortcuts(): void {
    document.addEventListener("keydown", (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Отключаем копирование, вставку, выделение всего
      if (
        isCtrl &&
        ["c", "v", "a", "x", "s", "p"].includes(e.key.toLowerCase())
      ) {
        const target = e.target as HTMLElement;
        if (!this.isEditableElement(target)) {
          e.preventDefault();
          return false;
        }
      }

      // Отключаем F12, Ctrl+Shift+I, Ctrl+U
      if (
        e.key === "F12" ||
        (isCtrl && e.shiftKey && e.key === "I") ||
        (isCtrl && e.key === "U")
      ) {
        e.preventDefault();
        return false;
      }

      // Отключаем Ctrl+Shift+J (консоль)
      if (isCtrl && e.shiftKey && e.key === "J") {
        e.preventDefault();
        return false;
      }
    });
  }

  /**
   * Отключает зум
   */
  private static disableZoom(): void {
    // Отключаем зум жестами (pinch), но разрешаем скролл
    document.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 2) {
          // Блокируем pinch-to-zoom при двух пальцах
          e.preventDefault();
        }
        // Одиночные касания (скролл) разрешаем
      },
      { passive: false }
    );

    document.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 2) {
          // Блокируем pinch-to-zoom
          e.preventDefault();
        }
        // Одиночные касания (скролл) разрешаем
      },
      { passive: false }
    );

    // Отключаем double-tap zoom, но разрешаем обычные клики
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

    // Отключаем Ctrl + колесо мыши (desktop zoom)
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

    // Отключаем клавиатурный зум
    document.addEventListener("keydown", (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      // Блокируем Ctrl + (+/-/0) для зума
      if (
        isCtrl &&
        (e.key === "+" ||
          e.key === "-" ||
          e.key === "0" ||
          e.key === "=" ||
          e.key === "_")
      ) {
        e.preventDefault();
      }
    });
  }

  /**
   * Отключает drag and drop
   */
  private static disableDragDrop(): void {
    document.addEventListener("dragstart", (e) => {
      e.preventDefault();
      return false;
    });

    document.addEventListener("drop", (e) => {
      e.preventDefault();
      return false;
    });

    document.addEventListener("dragover", (e) => {
      e.preventDefault();
      return false;
    });
  }

  /**
   * Отключает сохранение изображений
   */
  private static disableImageSaving(): void {
    // Отключаем правый клик на изображениях
    document.addEventListener("contextmenu", (e) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    });

    // Отключаем drag для изображений
    document.addEventListener("dragstart", (e) => {
      if ((e.target as HTMLElement).tagName === "IMG") {
        e.preventDefault();
        return false;
      }
    });
  }

  /**
   * Отключает инструменты разработчика
   */
  private static disableDevTools(): void {
    // Детект DevTools (приблизительно)
    const devtools = {
      open: false,
      orientation: null as string | null,
    };

    const threshold = 160;

    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          console.clear();
          console.log("🔒 DevTools detected and blocked");
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Блокируем console
  }

  /**
   * Проверяет, является ли элемент редактируемым
   */
  private static isEditableElement(element: HTMLElement): boolean {
    if (!element) return false;

    const tagName = element.tagName.toLowerCase();
    const isInput = ["input", "textarea", "select"].includes(tagName);
    const isContentEditable = element.contentEditable === "true";

    return isInput || isContentEditable;
  }

  /**
   * Временно разрешает выделение текста для элемента
   */
  static allowTextSelection(element: HTMLElement): void {
    const style = element.style as ExtendedCSSStyleDeclaration;
    element.style.webkitUserSelect = "text";
    style.mozUserSelect = "text";
    style.msUserSelect = "text";
    element.style.userSelect = "text";
  }

  /**
   * Запрещает выделение текста для элемента
   */
  static disableTextSelectionForElement(element: HTMLElement): void {
    const style = element.style as ExtendedCSSStyleDeclaration;
    element.style.webkitUserSelect = "none";
    style.mozUserSelect = "none";
    style.msUserSelect = "none";
    element.style.userSelect = "none";
    style.webkitTouchCallout = "none";
  }

  /**
   * Проверяет, активна ли защита
   */
  static isActive(): boolean {
    return this.isInitialized;
  }
}

// Автоматическая инициализация при загрузке
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      BrowserProtection.init()
    );
  } else {
    BrowserProtection.init();
  }
}
