"use client";

import { useState, useEffect } from "react";

export default function DebugLogsPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    // Override console.log to capture logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const originalInfo = console.info;

    const addLog = (message: string, type: string = 'LOG') => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] [${type}] ${message}`;
      setLogs(prev => [...prev.slice(-99), logEntry]); // Keep last 100 logs
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog(args.join(' '), 'LOG');
    };

    console.error = (...args) => {
      originalError(...args);
      addLog(args.join(' '), 'ERROR');
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog(args.join(' '), 'WARN');
    };

    console.info = (...args) => {
      originalInfo(...args);
      addLog(args.join(' '), 'INFO');
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    };
  }, []);

  const copyLogs = () => {
    const allLogs = logs.join('\n');
    navigator.clipboard.writeText(allLogs).then(() => {
      alert('Логи скопированы в буфер обмена!');
    }).catch(() => {
      alert('Ошибка копирования логов');
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testLogs = () => {
    console.log('Тестовое сообщение');
    console.error('Тестовая ошибка');
    console.warn('Тестовое предупреждение');
    console.info('Тестовая информация');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Logs Page</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={copyLogs}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Копировать все логи
            </button>
            <button
              onClick={clearLogs}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Очистить логи
            </button>
            <button
              onClick={testLogs}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Тестовые логи
            </button>
          </div>
          
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-gray-500">Нет логов...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1 break-words">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Инструкции:</h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Откройте ContractModal в приложении</li>
            <li>Нажмите "Показать логи" в модальном окне</li>
            <li>Выполните действия с договором</li>
            <li>Вернитесь на эту страницу для просмотра всех логов</li>
            <li>Используйте кнопку "Копировать все логи" для сохранения</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
