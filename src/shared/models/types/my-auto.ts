export interface MyCar {
  id: number;
  name: string;
  plate_number: string;
  photos: string[];
  available_minutes: number;
  latitude: number;
  longitude: number;
}

export interface MyCarsResponse {
  cars: MyCar[];
}

export interface MonthEarnings {
  year: number;
  month: number;
  total_earnings: number;
  trip_count: number;
  available_minutes?: number;
}

export interface Trip {
  id: number;
  duration_minutes: number;
  earnings: number;
  fuel_cost: number | null;
  rental_type: "minutes" | "hours" | "days";
  start_time: string;
  end_time: string;
  user_id?: number;
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
  client_before?: {
    photos: string[];
  } | null;
  client_after?: {
    photos: string[];
  } | null;
  mechanic_after?: {
    photos: string[];
  } | null;
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

export interface MechanicInspection {
  mechanic: {
    id: number;
    first_name: string;
    last_name: string;
    phone_number: string;
  };
  start_time: string;
  end_time: string;
  status: string;
  comment: string;
  photos_before: string[];
  photos_after: string[];
  client_rating: number;
  client_comment: string | null;
  mechanic_rating: number;
  mechanic_comment: string;
}

export interface TripDetailsResponse {
  id: number;
  vehicle_id: number;
  vehicle_name: string;
  vehicle_plate_number: string;
  duration_minutes: number;
  earnings: number;
  fuel_cost: number | null;
  rental_type: "minutes" | "hours" | "days";
  start_time: string;
  end_time: string;
  photos?: TripPhotos | null;
  route_map: RouteMap;
  mechanic_delivery?: any | null;
  mechanic_inspection?: MechanicInspection | null;
}
