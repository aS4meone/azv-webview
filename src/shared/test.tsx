"use client";

import { Drawer } from "@/components/ui/drawer";

export function TestDrawer() {
  return (
    <div className="space-y-4">
      {/* Drawer с большой страницей */}
      <Drawer
        title="Большая страница"
        trigger={
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            Открыть страницу
          </button>
        }
      >
        <div className="p-4">
          {/* Шапка страницы */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Профиль пользователя</h1>
            <p className="text-gray-600">
              Информация о пользователе и настройки
            </p>
          </div>

          {/* Основной контент */}
          <div className="space-y-8">
            {/* Секция информации */}
            <section className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">Личная информация</h2>
              <div className="grid gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Имя
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value="Иван Иванов"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value="ivan@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    value="+7 (999) 123-45-67"
                  />
                </div>
              </div>
            </section>

            {/* Секция уведомлений */}
            <section className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">
                Настройки уведомлений
              </h2>
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Уведомление {i + 1}</h3>
                      <p className="text-sm text-gray-500">
                        Описание настройки уведомления
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </section>

            {/* Секция истории */}
            <section className="bg-white rounded-lg border p-6">
              <h2 className="text-xl font-semibold mb-4">История активности</h2>
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Действие {i + 1}</p>
                      <p className="text-sm text-gray-500">
                        Описание действия пользователя в системе
                      </p>
                      <p className="text-xs text-gray-400 mt-1">2 часа назад</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Дополнительные секции */}
            {Array.from({ length: 3 }).map((_, sectionIndex) => (
              <section
                key={sectionIndex}
                className="bg-white rounded-lg border p-6"
              >
                <h2 className="text-xl font-semibold mb-4">
                  Дополнительная секция {sectionIndex + 1}
                </h2>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, itemIndex) => (
                    <div key={itemIndex} className="p-4 bg-gray-50 rounded-lg">
                      <h3 className="font-medium mb-2">
                        Подраздел {itemIndex + 1}
                      </h3>
                      <p className="text-gray-600">
                        Дополнительная информация и контент для тестирования
                        скролла и отображения большого количества данных в
                        drawer.
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </Drawer>

      {/* Боковой drawer с большой страницей */}
      <Drawer
        direction="right"
        title="Боковая страница"
        trigger={
          <button className="px-4 py-2 bg-purple-500 text-white rounded">
            Открыть боковую
          </button>
        }
      >
        <div className="p-4 space-y-6">
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Информация</h3>
            <p className="text-purple-700 text-sm mt-1">
              Это боковая панель с большим количеством контента
            </p>
          </div>

          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium mb-2">Раздел {i + 1}</h3>
              <p className="text-gray-600 text-sm">
                Содержимое раздела с подробным описанием и дополнительной
                информацией для тестирования скролла в боковой панели.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm font-medium">Параметр 1</p>
                  <p className="text-xs text-gray-500">Значение 1</p>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <p className="text-sm font-medium">Параметр 2</p>
                  <p className="text-xs text-gray-500">Значение 2</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
