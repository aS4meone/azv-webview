export const formatDate = (dateString: string) => {
  const serverDate = new Date(dateString);
  // Добавляем 5 часов к времени сервера (5 * 60 * 60 * 1000 миллисекунд)
  const localDate = new Date(serverDate.getTime() + 5 * 60 * 60 * 1000);

  return localDate.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
