export interface IHistory {
  history_id: string; // sid (short ID) - base64 encoded UUID
  date: string;
  car_name: string;
  final_total_price: number;
}

export interface IHistoryItmes {
  trip_history: IHistory[];
}

export interface ICarDetails {
  name: string;
  plate_number: string;
  fuel_level: number;
  latitude: number;
  longitude: number;
  course: number;
  engine_volume: number;
  drive_type: number;
  year: number;
  status: string;
}


export interface IHistoryItem {
  rental_history_detail: IRentalHistoryDetail;
}

export interface IActionHistory {
  action_type: string;
  timestamp: string;
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
  route_data: RouteData | null;
}

export interface IRentalHistoryDetail {
  history_id: string; // sid (short ID) - base64 encoded UUID
  user_id: string; // sid (short ID) - base64 encoded UUID
  car_id: number;
  rental_type: string;
  duration: number | null;
  start_latitude: number | null;
  start_longitude: number | null;
  end_latitude: number | null;
  end_longitude: number | null;
  start_time: string;
  end_time: string;
  reservation_time: string;
  photos_before: string[] | null;
  photos_after: string[] | null;
  already_payed: number | null;
  total_price: number | null;
  rental_status: string;
  base_price: number | null;
  open_fee: number | null;
  delivery_fee: number | null;
  waiting_fee: number | null;
  overtime_fee: number | null;
  distance_fee: number | null;
  car_details: ICarDetails;
  action_history: IActionHistory[];
  route_map: RouteMap;
}
