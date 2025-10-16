interface GoogleMapsResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
}

export const getAddressFromCoordinates = async (
  lat: number | null | undefined,
  lng: number | null | undefined
): Promise<string> => {
  // Проверка на null/undefined
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    console.warn("Invalid coordinates provided:", { lat, lng });
    return "Координаты недоступны";
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("Google Maps API key not found");
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=ru`
    );

    const data: GoogleMapsResponse = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    }

    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  } catch (error) {
    console.error("Error fetching address:", error);
    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
};

interface GeocodeResponse {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
  status: string;
}

// Вспомогательная функция для добавления города к адресу
const addCityToAddress = (address: string): string => {
  const cityKeywords = [
    "Алматы", "Алма-Ата", "город", "г.", "город Алматы",
    "Almaty", "Alma-Ata", "city", "Almaty city"
  ];
  const hasCityInfo = cityKeywords.some(keyword => 
    address.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // Используем английское название для лучшего поиска в Google Maps
  return hasCityInfo ? address : `${address}, Almaty, Kazakhstan`;
};

export const getCoordinatesFromAddress = async (
  address: string
): Promise<{ lat: number; lng: number; formatted_address: string } | null> => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.warn("Google Maps API key not found");
    return null;
  }

  try {
    // Добавляем "г. Алматы" если адрес не содержит информацию о городе
    const searchAddress = addCityToAddress(address);

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchAddress)}&key=${apiKey}&language=ru&region=kz`
    );

    const data: GeocodeResponse = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
        formatted_address: result.formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
};
