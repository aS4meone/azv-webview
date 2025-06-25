"use client";

import { useState, useEffect } from "react";

interface ClickData {
  id: number;
  timestamp: string;
  element_tag: string;
  element_id?: string;
  element_class?: string;
  element_text?: string;
  x_coordinate: number;
  y_coordinate: number;
  success: boolean;
  url: string;
  page_title: string;
}

interface Stats {
  totalClicks: number;
  successfulClicks: number;
  failedClicks: number;
  successRate: string;
}

export default function ClickTrackerViewer() {
  const [isVisible, setIsVisible] = useState(false);
  const [clicks, setClicks] = useState<ClickData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const BACKEND_URL = "http://localhost:3001";

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Получаем статистику
      const statsRes = await fetch(`${BACKEND_URL}/api/stats`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Получаем последние клики
      const clicksRes = await fetch(`${BACKEND_URL}/api/clicks`);
      if (clicksRes.ok) {
        const clicksData = await clicksRes.json();
        setClicks(clicksData.slice(0, 10)); // Последние 10 кликов
      }
    } catch (error) {
      console.error("Ошибка получения данных:", error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isVisible) {
      fetchData();
      // Обновляем данные каждые 2 секунды когда панель открыта
      const interval = setInterval(fetchData, 2000);
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsVisible(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium"
        >
          📊 Click Tracker
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 w-96 max-h-96 overflow-hidden">
      {/* Заголовок */}
      <div className="bg-blue-600 text-white px-4 py-2 flex justify-between items-center">
        <h3 className="font-semibold text-sm">🖱️ Click Tracker</h3>
        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="text-white hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            {isLoading ? "⟳" : "🔄"}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white hover:bg-blue-700 px-2 py-1 rounded text-xs"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="px-4 py-2 bg-gray-50 border-b">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-600">Всего кликов:</span>
              <span className="ml-1 font-semibold">{stats.totalClicks}</span>
            </div>
            <div>
              <span className="text-gray-600">Успешных:</span>
              <span className="ml-1 font-semibold text-green-600">
                {stats.successfulClicks}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Неудачных:</span>
              <span className="ml-1 font-semibold text-red-600">
                {stats.failedClicks}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Успешность:</span>
              <span className="ml-1 font-semibold">{stats.successRate}</span>
            </div>
          </div>
        </div>
      )}

      {/* Список кликов */}
      <div className="max-h-64 overflow-y-auto">
        {clicks.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {isLoading ? "Загрузка..." : "Нет данных о кликах"}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {clicks.map((click) => (
              <div key={click.id} className="p-3 hover:bg-gray-50">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {click.element_tag}
                    </span>
                    {click.success ? (
                      <span className="text-green-600 text-xs">✓</span>
                    ) : (
                      <span className="text-red-600 text-xs">✗</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(click.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {click.element_text && (
                  <div className="text-xs text-gray-700 mb-1 truncate">
                    "{click.element_text}"
                  </div>
                )}

                <div className="flex justify-between text-xs text-gray-500">
                  <span>
                    {click.element_id && `#${click.element_id}`}
                    {click.element_class &&
                      ` .${click.element_class.split(" ")[0]}`}
                  </span>
                  <span>
                    ({click.x_coordinate}, {click.y_coordinate})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Подвал */}
      <div className="px-4 py-2 bg-gray-50 border-t">
        <div className="text-xs text-gray-600 text-center">
          Обновление каждые 2 сек •
          <a
            href="http://localhost:3003/test"
            target="_blank"
            className="text-blue-600 hover:underline ml-1"
          >
            Тестовая страница
          </a>
        </div>
      </div>
    </div>
  );
}
