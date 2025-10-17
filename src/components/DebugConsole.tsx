"use client";

import { useState, useEffect, useRef } from "react";

interface LogEntry {
  id: number;
  timestamp: Date;
  level: "log" | "warn" | "error" | "info";
  message: string;
  args: any[];
}

interface DebugConsoleProps {
  maxLogs?: number;
  enabled?: boolean;
}

export const DebugConsole = ({ maxLogs = 100, enabled = true }: DebugConsoleProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "log" | "warn" | "error" | "info">("all");
  const logIdCounter = useRef(0);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;

    // Save original console methods
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    // Override console methods
    console.log = (...args: any[]) => {
      originalLog(...args);
      addLog("log", args);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      addLog("warn", args);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      addLog("error", args);
    };

    console.info = (...args: any[]) => {
      originalInfo(...args);
      addLog("info", args);
    };

    // Cleanup
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, [enabled, maxLogs]);

  // Auto scroll to bottom when new logs appear
  useEffect(() => {
    if (isOpen && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, isOpen]);

  const addLog = (level: "log" | "warn" | "error" | "info", args: any[]) => {
    const message = args
      .map(arg => {
        if (typeof arg === "object") {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");

    setLogs(prev => {
      const newLog: LogEntry = {
        id: logIdCounter.current++,
        timestamp: new Date(),
        level,
        message,
        args,
      };

      const updated = [...prev, newLog];
      return updated.slice(-maxLogs); // Keep only last N logs
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const exportLogs = () => {
    const logsText = logs
      .map(
        log =>
          `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join("\n");

    const blob = new Blob([logsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyLogs = async () => {
    const logsText = logs
      .map(
        log =>
          `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] ${log.message}`
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(logsText);
      alert("Логи скопированы в буфер обмена!");
    } catch (err) {
      alert("Не удалось скопировать логи");
    }
  };

  const filteredLogs = logs.filter(log => filter === "all" || log.level === filter);

  const getLevelColor = (level: string) => {
    switch (level) {
      case "error":
        return "text-red-600 bg-red-50";
      case "warn":
        return "text-yellow-600 bg-yellow-50";
      case "info":
        return "text-blue-600 bg-blue-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return "❌";
      case "warn":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📝";
    }
  };

  if (!enabled) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
        title="Открыть консоль отладки"
      >
        {isOpen ? "✕" : "🐛"}
      </button>

      {/* Console Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[9998] w-[90vw] max-w-2xl h-[60vh] bg-white rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-700">🐛 Debug Console</span>
              <span className="text-xs text-gray-500">({filteredLogs.length} логов)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearLogs}
                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                title="Очистить логи"
              >
                Очистить
              </button>
              <button
                onClick={copyLogs}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                title="Скопировать логи"
              >
                Копировать
              </button>
              <button
                onClick={exportLogs}
                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                title="Экспортировать логи"
              >
                Экспорт
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 p-2 border-b bg-gray-50">
            {(["all", "log", "warn", "error", "info"] as const).map(level => (
              <button
                key={level}
                onClick={() => setFilter(level)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  filter === level
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {level === "all" ? "Все" : level.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Logs */}
          <div className="flex-1 overflow-auto p-2 font-mono text-xs">
            {filteredLogs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                Нет логов для отображения
              </div>
            ) : (
              filteredLogs.map(log => (
                <div
                  key={log.id}
                  className={`mb-1 p-2 rounded ${getLevelColor(log.level)} border-l-2 ${
                    log.level === "error"
                      ? "border-red-500"
                      : log.level === "warn"
                      ? "border-yellow-500"
                      : log.level === "info"
                      ? "border-blue-500"
                      : "border-gray-500"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="flex-shrink-0">{getLevelIcon(log.level)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-500 mb-1">
                        {log.timestamp.toLocaleTimeString()}.
                        {log.timestamp.getMilliseconds().toString().padStart(3, "0")}
                      </div>
                      <pre className="whitespace-pre-wrap break-words">{log.message}</pre>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>

          {/* Footer */}
          <div className="p-2 border-t bg-gray-50 text-xs text-gray-500 rounded-b-lg">
            Логи обновляются в реальном времени • Максимум: {maxLogs} записей
          </div>
        </div>
      )}
    </>
  );
};
