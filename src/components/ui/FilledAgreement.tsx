"use client";

import React, { useEffect, useState } from 'react';

interface FilledAgreementProps {
  full_name?: string;
  login?: string;
  client_id?: string;
  digital_signature?: string;
}

const FilledAgreement: React.FC<FilledAgreementProps> = ({
  full_name = "Диас Абдиров",
  login = "dias_azv",
  client_id = "AZV-000123",
  digital_signature = "ESIGN-2025-12"
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAndFillHTML = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load the HTML file
        const response = await fetch('/docs/new/accession_agreement.html');
        
        if (!response.ok) {
          throw new Error('Failed to load HTML file');
        }

        let html = await response.text();

        // Replace placeholders with actual data
        html = html.replace(/\$\{full_name\}/g, full_name);
        html = html.replace(/\$\{login\}/g, login);
        html = html.replace(/\$\{client_id\}/g, client_id);
        html = html.replace(/\$\{digital_signature\}/g, digital_signature);

        // Add viewport meta tag and responsive styles if not present
        if (!html.includes('viewport')) {
          html = html.replace(
            '<head>',
            `<head>
              <meta name="viewport" content="width=device-width, initial-scale=0.3, maximum-scale=3.0, user-scalable=yes">
              <style>
                body {
                  margin: 0;
                  padding: 10px;
                }
                html, body {
                  overflow-x: auto;
                  overflow-y: auto;
                }
              </style>`
          );
        }

        setHtmlContent(html);
        setLoading(false);
      } catch (err) {
        console.error('Error loading HTML:', err);
        setError(err instanceof Error ? err.message : 'Failed to load HTML');
        setLoading(false);
      }
    };

    loadAndFillHTML();
  }, [full_name, login, client_id, digital_signature]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка документа...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 min-h-screen">
        <div className="text-center text-red-600">
          <p className="text-lg font-semibold mb-2">Ошибка загрузки документа</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Data Preview */}
      <div className="mb-4 p-4 bg-gray-50 rounded border border-gray-200">
        <h3 className="font-semibold mb-2 text-sm">Заполненные данные:</h3>
        <div className="text-sm space-y-1 text-gray-700">
          <p><span className="font-medium">ФИО Клиента:</span> {full_name}</p>
          <p><span className="font-medium">Логин Клиента:</span> {login}</p>
          <p><span className="font-medium">ID Клиента:</span> {client_id}</p>
          <p><span className="font-medium">Электронная подпись:</span> {digital_signature}</p>
        </div>
      </div>

      {/* HTML Document in iframe */}
      <div className="border border-gray-300 rounded overflow-auto bg-gray-100">
        <iframe
          srcDoc={htmlContent}
          className="w-full"
          style={{ 
            height: '80vh',
            minHeight: '600px',
            border: 'none',
            display: 'block'
          }}
          title="Filled Agreement Document"
          sandbox="allow-same-origin"
        />
      </div>

      {/* Download Button */}
      <div className="mt-4">
        <button
          onClick={() => {
            const blob = new Blob([htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'accession_agreement_filled.html';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
          className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Скачать документ (HTML)
        </button>
      </div>
    </div>
  );
};

export default FilledAgreement;
