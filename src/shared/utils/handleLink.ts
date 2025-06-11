declare global {
  interface Window {
    flutter_inappwebview?: {
      callHandler: (
        handlerName: string,
        ...args: unknown[]
      ) => Promise<unknown>;
    };
  }
}

export const handleLink = (url: string) => {
  // Проверяем, запущено ли приложение в Flutter WebView
  const isInWebView = window.flutter_inappwebview;

  if (isInWebView) {
    // Отправляем сообщение во Flutter через flutter_inappwebview
    window.flutter_inappwebview?.callHandler("openLink", url);
    return;
  }

  // Если не в WebView, открываем ссылку в новой вкладке
  window.open(url, "_blank");
};

// Хук для использования в компонентах
export const useHandleLink = () => {
  return (url: string) => {
    handleLink(url);
  };
};
