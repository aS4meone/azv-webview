export interface MyCar {
  id: number;
  name: string;
  plate_number: string;
}

export interface MyCarsResponse {
  cars: MyCar[];
}

export interface MonthEarnings {
  year: number;
  month: number;
  total_earnings: number;
  trip_count: number;
}

export interface Trip {
  id: number;
  duration_minutes: number;
  earnings: number;
  rental_type: "minutes" | "hours" | "days";
  start_time: string;
  end_time: string;
}

export interface CarTripsResponse {
  vehicle_id: number;
  vehicle_name: string;
  vehicle_plate_number: string;
  month_earnings: MonthEarnings;
  trips: Trip[];
  available_months: MonthEarnings[];
}

export interface TripPhotos {
  client_before: {
    photos: string[];
  };
  client_after: {
    photos: string[];
  };
  mechanic_after: {
    photos: string[];
  };
}

export interface RouteCoordinate {
  lat: number;
  lon: number;
  altitude: number;
  timestamp: number;
}

export interface DailyRoute {
  date: string;
  coordinates: RouteCoordinate[];
}

export interface RouteData {
  device_id: string;
  start_date: string;
  end_date: string;
  total_coordinates: number;
  daily_routes: DailyRoute[];
  fuel_start: string;
  fuel_end: string;
}

export interface RouteMap {
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  duration_over_24h: boolean;
  route_data: RouteData;
}

export interface TripDetailsResponse {
  id: number;
  vehicle_id: number;
  vehicle_name: string;
  vehicle_plate_number: string;
  duration_minutes: number;
  earnings: number;
  rental_type: "minutes" | "hours" | "days";
  start_time: string;
  end_time: string;
  photos: TripPhotos;
  route_map: RouteMap;
}
