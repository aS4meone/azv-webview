// Утилита для отладки дублирующихся запросов в WebView

interface RequestLog {
  timestamp: number;
  component: string;
  action: string;
  url?: string;
  stackTrace?: string;
}

class WebViewDebugger {
  private static instance: WebViewDebugger;
  private requestLogs: RequestLog[] = [];
  private isWebView: boolean;

  constructor() {
    this.isWebView =
      typeof window !== "undefined" &&
      typeof (window as any).flutter_inappwebview !== "undefined";

    if (this.isWebView) {
      console.log("🔍 [WebViewDebugger] Инициализирован для WebView");
    }
  }

  static getInstance(): WebViewDebugger {
    if (!WebViewDebugger.instance) {
      WebViewDebugger.instance = new WebViewDebugger();
    }
    return WebViewDebugger.instance;
  }

  logRequest(component: string, action: string, url?: string): void {
    if (!this.isWebView) return;

    const timestamp = Date.now();
    const stackTrace = new Error().stack;

    // Проверяем на дублирующиеся запросы за последние 1000ms
    const recentRequests = this.requestLogs.filter(
      (log) =>
        timestamp - log.timestamp < 1000 &&
        log.component === component &&
        log.action === action &&
        log.url === url
    );

    if (recentRequests.length > 0) {
      console.warn(`🚨 [WebViewDebugger] ДУБЛИРУЮЩИЙСЯ ЗАПРОС обнаружен!`, {
        component,
        action,
        url,
        duplicateCount: recentRequests.length,
        timeSinceFirst: timestamp - recentRequests[0].timestamp,
        previousStackTrace: recentRequests[0].stackTrace
          ?.split("\n")
          .slice(0, 5)
          .join("\n"),
        currentStackTrace: stackTrace?.split("\n").slice(0, 5).join("\n"),
      });
    }

    this.requestLogs.push({
      timestamp,
      component,
      action,
      url,
      stackTrace,
    });

    // Ограничиваем размер лога
    if (this.requestLogs.length > 100) {
      this.requestLogs = this.requestLogs.slice(-50);
    }

    console.log(
      `📊 [WebViewDebugger] ${component} -> ${action}${url ? ` (${url})` : ""}`
    );
  }

  getDuplicateStats(): { [key: string]: number } {
    const duplicates: { [key: string]: number } = {};
    const timestamp = Date.now();

    // Группируем запросы за последние 5 секунд
    const recentRequests = this.requestLogs.filter(
      (log) => timestamp - log.timestamp < 5000
    );

    recentRequests.forEach((log) => {
      const key = `${log.component}:${log.action}`;
      duplicates[key] = (duplicates[key] || 0) + 1;
    });

    return Object.fromEntries(
      Object.entries(duplicates).filter(([_, count]) => count > 1)
    );
  }

  printStats(): void {
    if (!this.isWebView) return;

    const duplicates = this.getDuplicateStats();
    if (Object.keys(duplicates).length > 0) {
      console.group("📈 [WebViewDebugger] Статистика дублирующихся запросов");
      Object.entries(duplicates).forEach(([key, count]) => {
        console.log(`${key}: ${count} запросов`);
      });
      console.groupEnd();
    }
  }
}

export const webviewDebugger = WebViewDebugger.getInstance();

// Автоматическая печать статистики каждые 10 секунд в WebView
if (typeof window !== "undefined") {
  setInterval(() => {
    webviewDebugger.printStats();
  }, 10000);
}
