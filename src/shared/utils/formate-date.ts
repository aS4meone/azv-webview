export const formatDate = (dateString: string, locale: string = "ru-RU") => {
  const serverDate = new Date(dateString);
  const localDate = new Date(serverDate.getTime());

  return localDate.toLocaleDateString(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
