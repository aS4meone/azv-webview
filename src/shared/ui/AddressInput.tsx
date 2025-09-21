import React, { useState, useRef, useEffect } from "react";
import { getCoordinatesFromAddress } from "@/shared/utils/googleMaps";

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

interface AddressSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface AddressInputProps {
  onAddressSelect: (address: string, lat: number, lng: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const AddressInput: React.FC<AddressInputProps> = ({
  onAddressSelect,
  placeholder = "Введите адрес доставки",
  className = "",
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null);
  const placesService = useRef<google.maps.places.PlacesService | null>(null);

  // Инициализация Google Places API
  useEffect(() => {
    const initGooglePlaces = () => {
      if (typeof window !== "undefined" && window.google?.maps?.places) {
        console.log("Initializing Google Places API...");
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        
        // Создаем невидимый div для PlacesService
        const div = document.createElement("div");
        placesService.current = new window.google.maps.places.PlacesService(div);
        console.log("Google Places API initialized successfully");
      } else {
        console.log("Google Maps API not loaded yet, retrying...");
        // Повторяем попытку через 1 секунду
        setTimeout(initGooglePlaces, 1000);
      }
    };

    // Попробуем инициализировать сразу
    initGooglePlaces();
    
    // Также попробуем загрузить Places API напрямую, если он не загружен
    if (typeof window !== "undefined" && !window.google?.maps?.places) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=ru`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("Places API loaded via script");
        initGooglePlaces();
      };
      document.head.appendChild(script);
    }
  }, []);

  // Поиск адресов при вводе
  const searchAddresses = async (query: string) => {
    console.log("Searching for:", query, "AutocompleteService available:", !!autocompleteService.current);
    
    if (!query.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (!autocompleteService.current) {
      console.error("AutocompleteService not initialized");
      return;
    }

    setIsLoading(true);
    
    try {
      // Добавляем "г. Алматы" к запросу для улучшения точности поиска
      const searchQuery = addCityToAddress(query);

      const request: google.maps.places.AutocompleteRequest = {
        input: searchQuery,
        language: "ru",
      };

      console.log("Making autocomplete request:", request);

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions, status) => {
          console.log("Autocomplete response:", { predictions, status });
          setIsLoading(false);
          
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            console.log("Found predictions:", predictions.length);
            setSuggestions(predictions);
            setShowSuggestions(true);
            setSelectedIndex(-1);
          } else {
            console.log("No predictions found or error:", status);
            setSuggestions([]);
            setShowSuggestions(false);
          }
        }
      );
    } catch (error) {
      console.error("Error searching addresses:", error);
      setIsLoading(false);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchAddresses(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  // Получение детальной информации об адресе
  const getPlaceDetails = (placeId: string) => {
    console.log("Getting place details for:", placeId);
    
    if (!placesService.current) {
      console.error("PlacesService not initialized");
      return;
    }

    const request: google.maps.places.PlaceDetailsRequest = {
      placeId: placeId,
      fields: ["formatted_address", "geometry"],
    };

    console.log("Making place details request:", request);

    placesService.current.getDetails(request, (place, status) => {
      console.log("Place details response:", { place, status });
      
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const address = place.formatted_address || "";
        const lat = place.geometry?.location?.lat() || 0;
        const lng = place.geometry?.location?.lng() || 0;
        
        console.log("Selected place:", { address, lat, lng });
        
        setInputValue(address);
        setShowSuggestions(false);
        setSuggestions([]);
        onAddressSelect(address, lat, lng);
      } else {
        console.error("Failed to get place details:", status);
      }
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSuggestionClick = (suggestion: AddressSuggestion) => {
    if (placesService.current) {
      getPlaceDetails(suggestion.place_id);
    } else {
      // Fallback: используем геокодирование напрямую
      handleDirectGeocoding(suggestion.description);
    }
  };

  const handleDirectGeocoding = async (address: string) => {
    console.log("Using direct geocoding for:", address);
    setIsLoading(true);
    
    try {
      // Добавляем "г. Алматы" к адресу для улучшения точности поиска
      const searchAddress = addCityToAddress(address);

      const result = await getCoordinatesFromAddress(searchAddress);
      if (result) {
        setInputValue(result.formatted_address);
        setShowSuggestions(false);
        setSuggestions([]);
        onAddressSelect(result.formatted_address, result.lat, result.lng);
      }
    } catch (error) {
      console.error("Direct geocoding failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => 
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => prev > 0 ? prev - 1 : -1);
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0) {
            handleSuggestionClick(suggestions[selectedIndex]);
          } else {
            // Если нет выбранного предложения, пытаемся найти адрес напрямую
            handleDirectGeocoding(inputValue);
          }
          break;
        case "Escape":
          setShowSuggestions(false);
          setSelectedIndex(-1);
          break;
      }
    } else if (e.key === "Enter" && inputValue.trim()) {
      // Если нет предложений, но есть текст, пытаемся найти адрес напрямую
      e.preventDefault();
      handleDirectGeocoding(inputValue);
    }
  };

  const handleBlur = () => {
    // Задержка для обработки клика по предложению
    setTimeout(() => {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(false);
    }
  };

  const handleClearInput = () => {
    setInputValue("");
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
            disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"
          }`}
        />
        
        {/* Clear icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <div className="w-5 h-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500"></div>
          ) : inputValue ? (
            <button
              onClick={handleClearInput}
              className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100 p-0.5 pr-[20px]"
              type="button"
              title="Очистить поле"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          ) : (
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.place_id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex items-start space-x-3">
                <svg
                  className="w-4 h-4 mt-1 text-gray-400 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  {suggestion.structured_formatting.secondary_text && (
                    <div className="text-xs text-gray-500 mt-1">
                      {suggestion.structured_formatting.secondary_text}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
