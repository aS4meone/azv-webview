export const formatDate = (dateString: string) => {
  const serverDate = new Date(dateString);
  const localDate = new Date(serverDate.getTime());

  return localDate.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
