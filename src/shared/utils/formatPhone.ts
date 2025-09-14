export const formatPhone = (value: string) => {
  // Убираем все нецифровые символы
  const digits = value.replace(/\D/g, "");
  
  // Если пустая строка, возвращаем пустую строку
  if (!digits) return "";
  
  // Разбиваем на части: первые 3 цифры, следующие 3, следующие 2, последние 2
  const parts = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/);
  if (!parts) return "";
  
  let formatted = "";
  if (parts[1]) formatted += "(" + parts[1];
  if (parts[2]) formatted += ") " + parts[2];
  if (parts[3]) formatted += " - " + parts[3];
  if (parts[4]) formatted += " - " + parts[4];
  
  return formatted;
};
