// Диагностический инструмент для анализа проблем с кликабельностью в Flutter WebView
// Следует плану из custom mode: diagnoseWebView.md

interface DiagnosisResult {
  elementFromPoint: {
    status: "ok" | "blocked" | "error";
    details: string;
    blockedBy?: string;
  };
  cssIssues: {
    pointerEvents: string[];
    zIndex: string[];
    tapHighlight: string[];
  };
  viewport: {
    status: "ok" | "issues";
    meta: string;
    issues: string[];
  };
  scriptLoading: {
    blobScripts: boolean;
    normalScripts: boolean;
    issues: string[];
  };
  webviewSettings: {
    isWebView: boolean;
    touchOptimizations: boolean;
    issues: string[];
  };
}

declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler: (
        handlerName: string,
        ...args: unknown[]
      ) => Promise<unknown>;
    };
    azvOptimizationsApplied?: boolean;
    webviewDiagnosis?: DiagnosisResult;
  }
}

export class WebViewDiagnosis {
  private static instance: WebViewDiagnosis;

  static getInstance(): WebViewDiagnosis {
    if (!WebViewDiagnosis.instance) {
      WebViewDiagnosis.instance = new WebViewDiagnosis();
    }
    return WebViewDiagnosis.instance;
  }

  // 1. Проверка document.elementFromPoint() согласно custom mode
  private checkElementFromPoint(
    x: number,
    y: number
  ): DiagnosisResult["elementFromPoint"] {
    try {
      const element = document.elementFromPoint(x, y);
      if (!element) {
        return {
          status: "error",
          details: `Элемент в точке (${x}, ${y}) не найден`,
        };
      }

      const tagName = element.tagName.toLowerCase();
      const isClickable = element.matches(
        'button, [role="button"], .cursor-pointer, a, [onclick]'
      );

      if (!isClickable && (tagName === "div" || tagName === "span")) {
        // Проверяем, что может блокировать клики
        const computedStyle = window.getComputedStyle(element);
        const pointerEvents = computedStyle.pointerEvents;
        const zIndex = computedStyle.zIndex;

        if (pointerEvents === "none") {
          return {
            status: "blocked",
            details: `Элемент ${tagName} блокирует клики из-за pointer-events: none`,
            blockedBy: "pointer-events",
          };
        }

        if (zIndex !== "auto" && parseInt(zIndex) > 1000) {
          return {
            status: "blocked",
            details: `Элемент ${tagName} с высоким z-index (${zIndex}) может блокировать клики`,
            blockedBy: "z-index",
          };
        }
      }

      return {
        status: "ok",
        details: `Элемент: ${tagName}, кликабельный: ${isClickable}`,
      };
    } catch (error) {
      return {
        status: "error",
        details: `Ошибка проверки elementFromPoint: ${error}`,
      };
    }
  }

  // 2. Проверка CSS: pointer-events, z-index, tap-highlight
  private checkCSSIssues(): DiagnosisResult["cssIssues"] {
    const result: DiagnosisResult["cssIssues"] = {
      pointerEvents: [],
      zIndex: [],
      tapHighlight: [],
    };

    // Проверяем все элементы на странице
    const allElements = document.querySelectorAll("*");

    allElements.forEach((element) => {
      const computedStyle = window.getComputedStyle(element);
      const tagName = element.tagName.toLowerCase();

      // Проверка pointer-events
      if (
        computedStyle.pointerEvents === "none" &&
        element.matches(
          'button, [role="button"], .cursor-pointer, a, [onclick]'
        )
      ) {
        result.pointerEvents.push(
          `${tagName}: pointer-events: none на кликабельном элементе`
        );
      }

      // Проверка z-index
      const zIndex = computedStyle.zIndex;
      if (zIndex !== "auto" && parseInt(zIndex) > 9999) {
        result.zIndex.push(`${tagName}: очень высокий z-index (${zIndex})`);
      }

      // Проверка tap-highlight
      const tapHighlight = (computedStyle as any).webkitTapHighlightColor;
      if (
        tapHighlight &&
        tapHighlight !== "transparent" &&
        tapHighlight !== "rgba(0, 0, 0, 0)"
      ) {
        result.tapHighlight.push(
          `${tagName}: tap-highlight не прозрачный (${tapHighlight})`
        );
      }
    });

    return result;
  }

  // 3. Проверка <meta viewport>
  private checkViewport(): DiagnosisResult["viewport"] {
    const viewportMeta = document.querySelector(
      'meta[name="viewport"]'
    ) as HTMLMetaElement;

    if (!viewportMeta) {
      return {
        status: "issues",
        meta: "отсутствует",
        issues: ["Meta viewport тег отсутствует"],
      };
    }

    const content = viewportMeta.content || "";
    const issues: string[] = [];

    // Проверяем важные параметры
    if (!content.includes("width=device-width")) {
      issues.push("Отсутствует width=device-width");
    }

    if (!content.includes("initial-scale=1")) {
      issues.push("Отсутствует initial-scale=1");
    }

    if (content.includes("user-scalable=no")) {
      issues.push("user-scalable=no может блокировать касания");
    }

    return {
      status: issues.length > 0 ? "issues" : "ok",
      meta: content,
      issues,
    };
  }

  // 4. Проверка типа загрузки скриптов (blob vs обычный)
  private checkScriptLoading(): DiagnosisResult["scriptLoading"] {
    const scripts = document.querySelectorAll("script");
    let blobScripts = false;
    let normalScripts = false;
    const issues: string[] = [];

    scripts.forEach((script) => {
      if (script.src) {
        if (script.src.startsWith("blob:")) {
          blobScripts = true;
        } else {
          normalScripts = true;
        }
      }
    });

    if (blobScripts) {
      issues.push(
        "Обнаружены blob: скрипты, которые могут вызывать проблемы в WebView"
      );
    }

    return {
      blobScripts,
      normalScripts,
      issues,
    };
  }

  // 5. Проверка настроек InAppWebView
  private checkWebViewSettings(): DiagnosisResult["webviewSettings"] {
    const isWebView = typeof window.flutter_inappwebview !== "undefined";
    const touchOptimizations = !!window.azvOptimizationsApplied;
    const issues: string[] = [];

    if (isWebView) {
      if (!touchOptimizations) {
        issues.push("AZV оптимизации касаний не применены");
      }

      // Проверяем настройки документа
      const docStyle = window.getComputedStyle(document.documentElement);
      if (docStyle.touchAction !== "pan-x pan-y") {
        issues.push(
          `touch-action документа: ${docStyle.touchAction} (должно быть pan-x pan-y)`
        );
      }
    } else {
      issues.push("Не в Flutter WebView окружении");
    }

    return {
      isWebView,
      touchOptimizations,
      issues,
    };
  }

  // Полная диагностика
  public runFullDiagnosis(
    testPoints?: { x: number; y: number }[]
  ): DiagnosisResult {
    console.log("🔍 Запуск полной диагностики WebView...");

    const defaultTestPoints = [
      { x: window.innerWidth / 2, y: window.innerHeight / 2 }, // Центр экрана
      { x: 100, y: 100 }, // Левый верхний угол
      { x: window.innerWidth - 100, y: 100 }, // Правый верхний угол
    ];

    const points = testPoints || defaultTestPoints;
    const elementFromPointResults = points.map((point) =>
      this.checkElementFromPoint(point.x, point.y)
    );

    // Берем первый результат для основного отчета
    const elementFromPoint = elementFromPointResults[0];

    const result: DiagnosisResult = {
      elementFromPoint,
      cssIssues: this.checkCSSIssues(),
      viewport: this.checkViewport(),
      scriptLoading: this.checkScriptLoading(),
      webviewSettings: this.checkWebViewSettings(),
    };

    // Сохраняем результат в window для отладки
    window.webviewDiagnosis = result;

    console.log("🔍 Результаты диагностики:", result);
    return result;
  }

  // Быстрая проверка кликабельности конкретного элемента
  public checkElementClickability(element: HTMLElement): {
    isClickable: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    const computedStyle = window.getComputedStyle(element);
    const isClickableElement = element.matches(
      'button, [role="button"], .cursor-pointer, a, [onclick]'
    );

    // Проверка CSS
    if (computedStyle.pointerEvents === "none") {
      issues.push("pointer-events: none");
      recommendations.push("Установить pointer-events: auto");
    }

    if (computedStyle.touchAction === "none") {
      issues.push("touch-action: none");
      recommendations.push("Установить touch-action: manipulation");
    }

    // Проверка перекрытий
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const topElement = document.elementFromPoint(centerX, centerY);

    if (topElement !== element && !element.contains(topElement)) {
      issues.push("Элемент перекрыт другим элементом");
      recommendations.push("Проверить z-index и позиционирование");
    }

    return {
      isClickable: isClickableElement && issues.length === 0,
      issues,
      recommendations,
    };
  }

  // Автоматическое исправление найденных проблем
  public autoFixIssues(): void {
    console.log("🔧 Автоматическое исправление проблем...");

    const diagnosis = this.runFullDiagnosis();

    // Исправляем CSS проблемы
    diagnosis.cssIssues.pointerEvents.forEach(() => {
      const problematicElements = document.querySelectorAll(
        'button, [role="button"], .cursor-pointer, a, [onclick]'
      );
      problematicElements.forEach((element) => {
        const style = (element as HTMLElement).style;
        if (window.getComputedStyle(element).pointerEvents === "none") {
          style.pointerEvents = "auto";
        }
      });
    });

    // Применяем touch оптимизации если не применены
    if (!diagnosis.webviewSettings.touchOptimizations) {
      this.applyTouchOptimizations();
    }

    console.log("🔧 Автоматическое исправление завершено");
  }

  private applyTouchOptimizations(): void {
    // Находим все кликабельные элементы
    const clickableElements = document.querySelectorAll(
      'button, [role="button"], .cursor-pointer, a, [onclick]'
    );

    clickableElements.forEach((element) => {
      const style = (element as HTMLElement).style as any;
      style.touchAction = "manipulation";
      style.webkitTouchCallout = "none";
      style.webkitTapHighlightColor = "transparent";
      (element as HTMLElement).setAttribute("data-azv-optimized", "true");
    });

    // Применяем базовые стили для документа
    document.documentElement.style.touchAction = "pan-x pan-y";
    document.body.style.touchAction = "pan-x pan-y";

    window.azvOptimizationsApplied = true;
    console.log("✅ Touch оптимизации применены");
  }
}

// Автоматическая инициализация при загрузке в WebView
if (
  typeof window !== "undefined" &&
  typeof window.flutter_inappwebview !== "undefined"
) {
  // Запускаем диагностику через 2 секунды после загрузки
  setTimeout(() => {
    const diagnosis = WebViewDiagnosis.getInstance();
    diagnosis.runFullDiagnosis();

    // Автоматическое исправление если есть проблемы
    diagnosis.autoFixIssues();
  }, 2000);
}

export const webviewDiagnosis = WebViewDiagnosis.getInstance();
