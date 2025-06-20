// Утилита для исправления проблем с кликами в Flutter WebView

// Расширяем интерфейс Window для Flutter WebView
declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler: (
        handlerName: string,
        ...args: unknown[]
      ) => Promise<unknown>;
    };
    azvOptimizationsApplied?: boolean;
  }
}

// Расширяем CSSStyleDeclaration для webkit свойств
interface ExtendedCSSStyleDeclaration extends CSSStyleDeclaration {
  webkitTouchCallout?: string;
  webkitTapHighlightColor?: string;
}

export interface ClickFixOptions {
  enableLogging?: boolean;
  checkInterval?: number;
  forceReattach?: boolean;
}

class ClickFixer {
  private isFixed = false;
  private checkInterval?: NodeJS.Timeout;
  private options: Required<ClickFixOptions>;

  constructor(options: ClickFixOptions = {}) {
    this.options = {
      enableLogging: options.enableLogging ?? true,
      checkInterval: options.checkInterval ?? 5000,
      forceReattach: options.forceReattach ?? false,
    };
  }

  private log(message: string, ...args: unknown[]) {
    if (this.options.enableLogging) {
      console.log(`[ClickFixer] ${message}`, ...args);
    }
  }

  private isInWebView(): boolean {
    return typeof window.flutter_inappwebview !== "undefined";
  }

  private fixElementClicks(element: HTMLElement) {
    // Проверяем, уже ли исправлен этот элемент
    if (element.hasAttribute("data-click-fixed")) {
      return;
    }

    // Сохраняем оригинальные обработчики
    const originalClick = element.onclick;

    // Исправляем стили для лучшей работы касаний
    const style = element.style as ExtendedCSSStyleDeclaration;
    style.touchAction = "manipulation";
    style.webkitTouchCallout = "none";
    style.webkitTapHighlightColor = "transparent";
    style.pointerEvents = "auto";

    // Добавляем резервный обработчик для touchend
    const handleTouch = (e: TouchEvent) => {
      e.stopPropagation();

      // Эмулируем клик, если оригинальный не сработал
      setTimeout(() => {
        if (originalClick) {
          originalClick.call(element, new MouseEvent("click"));
        } else {
          element.click();
        }
      }, 10);
    };

    element.addEventListener("touchend", handleTouch, { passive: true });

    // Отмечаем элемент как исправленный
    element.setAttribute("data-click-fixed", "true");
  }

  private scanAndFixElements() {
    const selectors = [
      "button",
      "[role='button']",
      ".cursor-pointer",
      "a[href]",
      "[onclick]",
      "[data-testid*='button']",
      ".btn",
      ".button",
    ];

    const elements = document.querySelectorAll<HTMLElement>(
      selectors.join(", ")
    );

    let fixedCount = 0;
    elements.forEach((element) => {
      if (!element.hasAttribute("data-click-fixed")) {
        this.fixElementClicks(element);
        fixedCount++;
      }
    });

    if (fixedCount > 0) {
      this.log(`Fixed ${fixedCount} clickable elements`);
    }

    return fixedCount;
  }

  private setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      let hasNewElements = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          hasNewElements = true;
        }
      });

      if (hasNewElements) {
        // Ждем немного, чтобы элементы полностью отрендерились
        setTimeout(() => {
          this.scanAndFixElements();
        }, 100);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.log("Mutation observer setup complete");
    return observer;
  }

  private setupPeriodicCheck() {
    this.checkInterval = setInterval(() => {
      if (this.isInWebView()) {
        const fixedCount = this.scanAndFixElements();
        if (fixedCount > 0) {
          this.log(`Periodic check: fixed ${fixedCount} new elements`);
        }
      }
    }, this.options.checkInterval);

    this.log(`Periodic check enabled (every ${this.options.checkInterval}ms)`);
  }

  public init(): void {
    if (this.isFixed && !this.options.forceReattach) {
      this.log("Already initialized, skipping");
      return;
    }

    this.log("Initializing click fixer...");

    // Начальное сканирование
    const initialFixed = this.scanAndFixElements();
    this.log(`Initial scan: fixed ${initialFixed} elements`);

    // Настраиваем наблюдение за новыми элементами
    this.setupMutationObserver();

    // Настраиваем периодическую проверку
    this.setupPeriodicCheck();

    this.isFixed = true;
    this.log("Click fixer initialized successfully");
  }

  public destroy(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }

    // Удаляем атрибуты фикса
    const fixedElements = document.querySelectorAll("[data-click-fixed]");
    fixedElements.forEach((element) => {
      element.removeAttribute("data-click-fixed");
    });

    this.isFixed = false;
    this.log("Click fixer destroyed");
  }

  public forceRefresh(): void {
    this.log("Force refreshing click handlers...");
    const fixedCount = this.scanAndFixElements();
    this.log(`Force refresh: processed ${fixedCount} elements`);
  }
}

// Глобальная инстанция
let globalClickFixer: ClickFixer | null = null;

export const initClickFixer = (options?: ClickFixOptions): void => {
  if (globalClickFixer) {
    globalClickFixer.destroy();
  }

  globalClickFixer = new ClickFixer(options);
  globalClickFixer.init();
};

export const destroyClickFixer = (): void => {
  if (globalClickFixer) {
    globalClickFixer.destroy();
    globalClickFixer = null;
  }
};

export const refreshClickFixer = (): void => {
  if (globalClickFixer) {
    globalClickFixer.forceRefresh();
  }
};

// Автоматическая инициализация для WebView
if (typeof window !== "undefined") {
  // Проверяем, находимся ли мы в Flutter WebView
  const isWebView = typeof window.flutter_inappwebview !== "undefined";

  if (isWebView) {
    // Инициализируем после загрузки DOM
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        initClickFixer();
      });
    } else {
      initClickFixer();
    }
  }
}

// Экспортируем для использования в других частях приложения
export { ClickFixer };
export default { initClickFixer, destroyClickFixer, refreshClickFixer };
