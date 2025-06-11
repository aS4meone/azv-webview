export const formatImage = (url: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return cleanBaseUrl + cleanUrl;
};
