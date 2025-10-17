"use client";

import React, { useState } from 'react';
import FilledAgreement from '@/components/ui/FilledAgreement';

export default function TestAgreementPage() {
  const [clientData, setClientData] = useState({
    full_name: "Диас Абдиров",
    login: "dias_azv",
    client_id: "AZV-000123",
    digital_signature: "ESIGN-2025-12"
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Тест заполнения договора</h1>
          <p className="text-gray-600">Проверка компонента FilledAgreement (HTML-based)</p>
        </div>

        {/* Client Data Form */}
        <div className="mb-6 bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Данные клиента</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">ФИО Клиента</label>
              <input
                type="text"
                value={clientData.full_name}
                onChange={(e) => setClientData({ ...clientData, full_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Логин Клиента</label>
              <input
                type="text"
                value={clientData.login}
                onChange={(e) => setClientData({ ...clientData, login: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">ID Клиента</label>
              <input
                type="text"
                value={clientData.client_id}
                onChange={(e) => setClientData({ ...clientData, client_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Электронная подпись</label>
              <input
                type="text"
                value={clientData.digital_signature}
                onChange={(e) => setClientData({ ...clientData, digital_signature: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Filled Agreement Component */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Заполненный договор</h2>
          <FilledAgreement
            full_name={clientData.full_name}
            login={clientData.login}
            client_id={clientData.client_id}
            digital_signature={clientData.digital_signature}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-blue-900">📝 Как это работает:</h3>
          <ol className="text-sm space-y-2 list-decimal list-inside text-blue-800">
            <li>HTML файл загружается из <code>/docs/new/accession_agreement.html</code></li>
            <li>Плейсхолдеры ${'{'}full_name{'}'}, ${'{'}login{'}'}, ${'{'}client_id{'}'}, ${'{'}digital_signature{'}'} автоматически заменяются</li>
            <li>Заполненный HTML отображается в iframe</li>
            <li>Можно изменить данные в форме выше и увидеть результат в реальном времени</li>
            <li>Нажмите кнопку "Скачать документ" для сохранения заполненного HTML</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

