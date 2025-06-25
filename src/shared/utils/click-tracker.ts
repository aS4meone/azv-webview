// Утилита для отправки данных о кликах на backend сервер

interface ClickData {
  elementTag: string;
  elementId?: string;
  elementClass?: string;
  elementText?: string;
  x: number;
  y: number;
  success: boolean;
  errorMessage?: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  url: string;
  pageTitle: string;
}

interface DiagnosticData {
  diagnosticResults: any;
  elementsFixed?: number;
  pointerEventsFixed?: number;
  cssIssuesFound?: number;
  webviewSettings: any;
  userAgent: string;
  url: string;
}

class ClickTracker {
  private static instance: ClickTracker;
  private backendUrl: string;
  private isEnabled: boolean = true;

  constructor() {
    // Определяем URL backend сервера
    this.backendUrl = this.getBackendUrl();
    console.log(
      "🔧 Click Tracker initialized with backend URL:",
      this.backendUrl
    );
    this.setupClickTracking();
  }

  static getInstance(): ClickTracker {
    if (!ClickTracker.instance) {
      ClickTracker.instance = new ClickTracker();
    }
    return ClickTracker.instance;
  }

  private getBackendUrl(): string {
    // В разработке используем localhost, в продакшн - переменную окружения
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === "localhost" || hostname === "127.0.0.1") {
        return "http://localhost:3001";
      }
    }

    // В продакшн можно использовать переменную окружения или относительный путь
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
  }

  private getDeviceInfo() {
    if (typeof window === "undefined") return {};

    return {
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      language: navigator.language,
      platform: navigator.platform,
      isWebView: typeof (window as any).flutter_inappwebview !== "undefined",
      timestamp: new Date().toISOString(),
    };
  }

  private async sendData(endpoint: string, data: any): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      console.log(
        `🚀 Отправляем данные на ${this.backendUrl}${endpoint}:`,
        data
      );

      const response = await fetch(`${this.backendUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(
          `⚠️ Ошибка отправки на ${endpoint}:`,
          response.status,
          errorText
        );
        return false;
      }

      const result = await response.json();
      console.log(`✅ Данные отправлены на ${endpoint}:`, result);
      return true;
    } catch (error) {
      console.error(`⚠️ Ошибка отправки данных на ${endpoint}:`, error);
      return false;
    }
  }

  // Отправка данных о клике
  async trackClick(
    element: HTMLElement,
    event: MouseEvent | TouchEvent,
    success: boolean = true,
    errorMessage?: string
  ): Promise<void> {
    const coordinates = this.getEventCoordinates(event);
    const deviceInfo = this.getDeviceInfo();

    const clickData: ClickData = {
      elementTag: element.tagName.toLowerCase(),
      elementId: element.id || undefined,
      elementClass: element.className || undefined,
      elementText: this.getElementText(element),
      x: coordinates.x,
      y: coordinates.y,
      success,
      errorMessage,
      userAgent: navigator.userAgent,
      screenWidth: deviceInfo.screenWidth || 0,
      screenHeight: deviceInfo.screenHeight || 0,
      viewportWidth: deviceInfo.viewportWidth || 0,
      viewportHeight: deviceInfo.viewportHeight || 0,
      devicePixelRatio: deviceInfo.devicePixelRatio || 1,
      url: window.location.href,
      pageTitle: document.title,
    };

    await this.sendData("/api/clicks", clickData);
  }

  // Отправка диагностических данных
  async trackDiagnosis(diagnosisResult: any): Promise<void> {
    const deviceInfo = this.getDeviceInfo();

    const diagnosticData: DiagnosticData = {
      diagnosticResults: diagnosisResult,
      elementsFixed: diagnosisResult.fixedElementsCount || 0,
      pointerEventsFixed: diagnosisResult.pointerEventsFixed || 0,
      cssIssuesFound: diagnosisResult.cssIssuesFound || 0,
      webviewSettings: {
        isWebView: deviceInfo.isWebView,
        userAgent: deviceInfo.userAgent,
        ...diagnosisResult.webviewSettings,
      },
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    await this.sendData("/api/webview-diagnosis", diagnosticData);
  }

  private getEventCoordinates(event: MouseEvent | TouchEvent): {
    x: number;
    y: number;
  } {
    if ("touches" in event && event.touches.length > 0) {
      return {
        x: Math.round(event.touches[0].clientX),
        y: Math.round(event.touches[0].clientY),
      };
    } else if ("clientX" in event) {
      return {
        x: Math.round(event.clientX),
        y: Math.round(event.clientY),
      };
    }
    return { x: 0, y: 0 };
  }

  private getElementText(element: HTMLElement): string {
    // Получаем текст элемента, обрезаем до 100 символов
    const text = element.textContent || element.innerText || "";
    return text.trim().substring(0, 100);
  }

  private setupClickTracking(): void {
    if (typeof window === "undefined") return;

    // Отслеживание всех кликов на странице
    const trackClickEvent = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      if (!target) return;

      // Проверяем, является ли элемент кликабельным
      const isClickable = target.matches(
        'button, [role="button"], .cursor-pointer, a, [onclick], input[type="button"], input[type="submit"]'
      );

      if (isClickable) {
        // Проверяем успешность клика
        const computedStyle = window.getComputedStyle(target);
        const hasPointerEventsIssue = computedStyle.pointerEvents === "none";
        const coordinates = this.getEventCoordinates(event);
        const elementAtPoint = document.elementFromPoint(
          coordinates.x,
          coordinates.y
        );
        const hasZIndexIssue = target !== elementAtPoint;

        const success = !hasPointerEventsIssue && !hasZIndexIssue;
        const errorMessage = hasPointerEventsIssue
          ? "pointer-events: none"
          : hasZIndexIssue
          ? "Element covered by another element"
          : undefined;

        // Отправляем данные о клике
        console.log("🖱️ Detected click on clickable element:", {
          tag: target.tagName.toLowerCase(),
          id: target.id,
          class: target.className,
          success,
          errorMessage,
        });
        this.trackClick(target, event, success, errorMessage);
      }
    };

    // Добавляем обработчики событий
    document.addEventListener("click", trackClickEvent, true);
    document.addEventListener("touchend", trackClickEvent, true);

    console.log("🎯 Click tracking activated for backend:", this.backendUrl);
  }

  // Публичные методы для управления
  enable(): void {
    this.isEnabled = true;
    console.log("✅ Click tracking enabled");
  }

  disable(): void {
    this.isEnabled = false;
    console.log("❌ Click tracking disabled");
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.backendUrl}/health`);
      const result = await response.json();
      console.log("🔗 Backend connection test:", result);
      return response.ok;
    } catch (error) {
      console.error("❌ Backend connection failed:", error);
      return false;
    }
  }

  // Ручная отправка клика для тестирования
  async sendTestClick(): Promise<void> {
    const testClickData: ClickData = {
      elementTag: "button",
      elementId: "test-button",
      elementClass: "test-class",
      elementText: "Test Click",
      x: 100,
      y: 200,
      success: true,
      errorMessage: undefined,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      url: window.location.href,
      pageTitle: document.title,
    };

    console.log("🧪 Sending test click data...");
    await this.sendData("/api/clicks", testClickData);
  }
}

// Экспорт singleton instance
export const clickTracker = ClickTracker.getInstance();

// Глобальная функция для тестирования из консоли браузера
if (typeof window !== "undefined") {
  (window as any).clickTracker = clickTracker;
}
