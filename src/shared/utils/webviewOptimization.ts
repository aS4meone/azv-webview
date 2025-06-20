// Утилиты для оптимизации касаний и кликов в WebView
export class WebViewTouchOptimizer {
  private static isInitialized = false;
  private static lastClickTime = 0;
  private static readonly CLICK_DEBOUNCE_TIME = 300; // 300ms между кликами

  /**
   * Инициализирует оптимизацию касаний для WebView
   */
  static initialize() {
    if (this.isInitialized || typeof window === "undefined") {
      return;
    }

    this.isInitialized = true;

    // Убираем задержку клика iOS
    document.addEventListener("touchstart", () => {}, { passive: true });

    // Добавляем глобальные стили для оптимизации касаний
    this.injectGlobalStyles();

    // Добавляем дебаунс для кликов
    this.setupClickDebouncing();

    // Оптимизируем обработку касаний
    this.optimizeTouchHandling();

    console.log("WebView touch optimization initialized");
  }

  /**
   * Инжектирует глобальные стили для оптимизации касаний
   */
  private static injectGlobalStyles() {
    const style = document.createElement("style");
    style.id = "webview-touch-optimization";
    style.textContent = `
      /* WebView Touch Optimization */
      * {
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      button, [role="button"], .cursor-pointer {
        touch-action: manipulation !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
        cursor: pointer !important;
      }
      
      /* Исправляем активные состояния */
      .active\\:scale-95:active,
      .active\\:scale-\\[0\\.98\\]:active {
        transform: scale(0.95) !important;
        transition: transform 0.1s ease !important;
      }
      
      /* Предотвращаем проблемы с pointer-events */
      .pointer-events-none {
        pointer-events: none !important;
      }
      
      .pointer-events-auto {
        pointer-events: auto !important;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Настраивает дебаунсинг кликов для предотвращения двойных срабатываний
   */
  private static setupClickDebouncing() {
    document.addEventListener(
      "click",
      (e) => {
        const currentTime = Date.now();

        if (currentTime - this.lastClickTime < this.CLICK_DEBOUNCE_TIME) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }

        this.lastClickTime = currentTime;
      },
      true
    );
  }

  /**
   * Оптимизирует обработку касаний для кнопок
   */
  private static optimizeTouchHandling() {
    document.addEventListener(
      "touchend",
      (e) => {
        const target = e.target as HTMLElement;
        const button = this.findClickableParent(target);

        if (button && this.isElementClickable(button)) {
          // Небольшая задержка для синхронизации с анимациями
          setTimeout(() => {
            if (this.isElementClickable(button)) {
              button.click();
            }
          }, 10);
        }
      },
      { passive: true }
    );
  }

  /**
   * Находит ближайший кликабельный родительский элемент
   */
  private static findClickableParent(element: HTMLElement): HTMLElement | null {
    let current = element;

    while (current && current !== document.body) {
      if (
        current.tagName === "BUTTON" ||
        current.getAttribute("role") === "button" ||
        current.classList.contains("cursor-pointer") ||
        current.onclick !== null
      ) {
        return current;
      }
      current = current.parentElement as HTMLElement;
    }

    return null;
  }

  /**
   * Проверяет, может ли элемент быть кликнут
   */
  private static isElementClickable(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
      style.pointerEvents !== "none" &&
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      !element.hasAttribute("disabled")
    );
  }

  /**
   * Оптимизирует конкретный элемент для касаний
   */
  static optimizeElement(element: HTMLElement) {
    if (!element) return;

    // Применяем стили для оптимизации касаний
    element.style.touchAction = "manipulation";
    (
      element.style as CSSStyleDeclaration & { webkitTouchCallout: string }
    ).webkitTouchCallout = "none";
    (
      element.style as CSSStyleDeclaration & { webkitTapHighlightColor: string }
    ).webkitTapHighlightColor = "transparent";

    // Если это кнопка, добавляем дополнительную оптимизацию
    if (
      element.tagName === "BUTTON" ||
      element.getAttribute("role") === "button"
    ) {
      element.style.cursor = "pointer";
      element.style.pointerEvents = element.hasAttribute("disabled")
        ? "none"
        : "auto";
    }
  }

  /**
   * Создает оптимизированный обработчик клика с дебаунсингом
   */
  static createOptimizedClickHandler(
    originalHandler: (e: Event) => void,
    debounceTime: number = 300
  ) {
    let lastCall = 0;

    return (e: Event) => {
      const now = Date.now();

      if (now - lastCall >= debounceTime) {
        lastCall = now;
        originalHandler(e);
      }
    };
  }

  /**
   * Исправляет проблемы с z-index в модальных окнах
   */
  static fixModalZIndex() {
    const modals = document.querySelectorAll('[class*="z-"]');
    modals.forEach((modal) => {
      const element = modal as HTMLElement;
      const zIndex = window.getComputedStyle(element).zIndex;

      if (zIndex && zIndex !== "auto") {
        element.style.zIndex = zIndex;
      }
    });
  }
}

// Автоматическая инициализация при загрузке
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      WebViewTouchOptimizer.initialize();
    });
  } else {
    WebViewTouchOptimizer.initialize();
  }
}

export default WebViewTouchOptimizer;
