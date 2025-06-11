"use client";
import { ArrowLocationIcon, MinusIcon, PlusIcon } from "@/shared/icons";
import { ICar } from "@/shared/models/types/car";
import { Button } from "@/shared/ui";
import { useModal } from "@/shared/ui/modal";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useVehiclesStore } from "@/shared/stores/vechiclesStore";
import { useUserStore } from "@/shared/stores/userStore";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { handleCarInteraction } from "@/_pages/main/utils/car-interaction";

const MapWithMarkers = ({ zoom }: { zoom: number }) => {
  const { showModal, hideModal } = useModal();
  const { fetchAllVehicles, allVehicles } = useVehiclesStore();
  const { user } = useUserStore();
  const map = useMap();

  const clustererRef = useRef<MarkerClusterer | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const markerLibraryLoadedRef = useRef(false);

  // Fetch vehicles only once
  useEffect(() => {
    if (!user.current_rental) {
      fetchAllVehicles();
    }
  }, [fetchAllVehicles, user.current_rental]);

  // Мемоизированный список уникальных машин
  const uniqueVehicles = useMemo(() => {
    // Если у пользователя есть аренда, показываем только его машину
    if (user.current_rental?.car_details) {
      return [user.current_rental.car_details];
    }

    // Если аренды нет, показываем все доступные машины
    return [...allVehicles];
  }, [allVehicles, user.current_rental]);

  // Memoize marker size calculation (aspect ratio 11.749:29)
  const markerSizes = useMemo(() => {
    const baseWidth = zoom < 10 ? 8 : zoom < 13 ? 11.749 : zoom < 16 ? 16 : 20;
    const aspectRatio = 29 / 12; // ~2.47
    const width = baseWidth;
    const height = baseWidth * aspectRatio;
    const textSize = zoom < 10 ? 8 : zoom < 13 ? 10 : zoom < 16 ? 12 : 14;
    return { width, height, textSize };
  }, [zoom]);

  // Optimized marker creation function
  const createAdvancedMarker = useCallback(
    (vehicle: ICar) => {
      if (!window.google?.maps?.marker?.AdvancedMarkerElement) {
        console.log("❌ Google Maps marker library not loaded");
        return null;
      }

      const {
        width: markerWidth,
        height: markerHeight,
        textSize,
      } = markerSizes;

      // Create marker content
      const markerDiv = document.createElement("div");
      markerDiv.style.cssText = `
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        transform: rotate(${vehicle.course}deg);
      `;

      // Add vehicle name if zoom is sufficient
      if (zoom >= 12) {
        const nameDiv = document.createElement("div");
        nameDiv.style.cssText = `
          background-color: rgba(255, 255, 255, 0.9);
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: ${textSize}px;
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
          margin-bottom: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        `;
        nameDiv.textContent = vehicle.name;
        markerDiv.appendChild(nameDiv);
      }

      // Add car icon
      const iconImg = document.createElement("img");
      iconImg.src = "/images/carmarker.png";
      iconImg.alt = "Car marker";
      iconImg.style.cssText = `
        width: ${markerWidth}px;
        height: ${markerHeight}px;
      `;
      markerDiv.appendChild(iconImg);

      // Create marker
      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        position: { lat: vehicle.latitude, lng: vehicle.longitude },
        content: markerDiv,
        title: vehicle.name,
      });

      // Add click handler
      marker.addListener("click", () => {
        const content = handleCarInteraction({
          user,
          notRentedCar: vehicle,
          hideModal: () => {
            hideModal();
          },
        });

        if (content === null) {
          return;
        }

        showModal({
          children: content,
        });
      });

      return marker;
    },
    [zoom, markerSizes, showModal, hideModal, user]
  );

  // Single effect to manage all markers and clustering
  useEffect(() => {
    if (!map || !uniqueVehicles.length) {
      return;
    }

    const initializeMarkers = async () => {
      try {
        if (
          !window.google?.maps?.marker?.AdvancedMarkerElement &&
          !markerLibraryLoadedRef.current
        ) {
          markerLibraryLoadedRef.current = true;
          await window.google.maps.importLibrary("marker");
          console.log("✅ Marker library loaded");
        }

        // Clear existing markers and clusterer
        if (clustererRef.current) {
          clustererRef.current.clearMarkers();
        }

        // Clear previous markers from memory
        markersRef.current.forEach((marker) => {
          if (marker.map) {
            marker.map = null;
          }
        });
        markersRef.current = [];

        // Create new markers
        const newMarkers = uniqueVehicles
          .map((vehicle) => createAdvancedMarker(vehicle))
          .filter(Boolean) as google.maps.marker.AdvancedMarkerElement[];

        markersRef.current = newMarkers;

        // Create or update clusterer
        if (!clustererRef.current) {
          clustererRef.current = new MarkerClusterer({
            map,
            markers: newMarkers,
            algorithmOptions: {
              maxZoom: 15,
            },
            renderer: {
              render: ({ count, position }) => {
                // Create custom cluster marker
                const clusterDiv = document.createElement("div");
                clusterDiv.style.cssText = `
                   width: ${Math.max(40, Math.min(60, count * 2 + 30))}px;
                   height: ${Math.max(40, Math.min(60, count * 2 + 30))}px;
                   background-color: #191919;
                   color: white;
                   border-radius: 50%;
                   display: flex;
                   align-items: center;
                   justify-content: center;
                   font-weight: bold;
                   font-size: ${count > 99 ? 12 : count > 9 ? 14 : 16}px;
                   border: 3px solid white;
                   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                   cursor: pointer;
                 `;
                clusterDiv.textContent = count.toString();

                return new google.maps.marker.AdvancedMarkerElement({
                  position,
                  content: clusterDiv,
                });
              },
            },
          });
        } else {
          clustererRef.current.addMarkers(newMarkers);
        }
      } catch (error) {
        console.log(error);
      }
    };

    initializeMarkers();
  }, [map, uniqueVehicles, zoom, createAdvancedMarker, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
      markersRef.current.forEach((marker) => {
        if (marker.map) {
          marker.map = null;
        }
      });
      markersRef.current = [];
    };
  }, []);

  return null;
};

export const MapComponent = () => {
  const { user } = useUserStore();
  const [zoom, setZoom] = useState(15);
  const [center, setCenter] = useState({ lat: 43.222, lng: 76.8512 });
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const zoomIn = useCallback(
    () => setZoom((prev) => Math.min(prev + 1, 20)),
    []
  );
  const zoomOut = useCallback(
    () => setZoom((prev) => Math.max(prev - 1, 1)),
    []
  );

  const centerToUser = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCenter = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCenter(newCenter);
          setUserLocation(newCenter);
          setZoom(16);
        },
        (error) => {
          console.error("Ошибка получения местоположения:", error);
        }
      );
    }
  }, []);

  if (!user) {
    return <div>Загрузка...</div>;
  }

  return (
    <div className="relative h-screen w-full">
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          zoom={zoom}
          center={center}
          mapId="DEMO_MAP_ID"
          onZoomChanged={(e) => setZoom(e.detail.zoom)}
          onCenterChanged={(e) => setCenter(e.detail.center)}
          gestureHandling="greedy"
          disableDefaultUI={true}
        >
          <MapWithMarkers zoom={zoom} />
          {userLocation && (
            <AdvancedMarker position={userLocation}>
              <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
            </AdvancedMarker>
          )}
        </Map>
      </APIProvider>

      {/* Контролы карты */}
      <div className="absolute right-4 top-1/2 flex flex-col gap-2">
        <Button onClick={zoomIn} variant="icon" className="shadow-lg">
          <PlusIcon color="#191919" />
        </Button>
        <Button onClick={zoomOut} variant="icon" className="shadow-lg">
          <MinusIcon />
        </Button>
        <Button onClick={centerToUser} variant="icon" className="shadow-lg">
          <ArrowLocationIcon />
        </Button>
      </div>
    </div>
  );
};
