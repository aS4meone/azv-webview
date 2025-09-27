export enum CarStatus {
  free = "FREE",
  inUse = "IN_USE",
  service = "SERVICE",
  owner = "OWNER",
  pending = "PENDING",
  failure = "FAILURE",
  reserved = "RESERVED",
  delivering = "DELIVERING",
  tracking = "TRACKING",
  deliveryReserved = "delivery_reserved",
  deliveryInProgress = "delivering_in_progress",
}

export enum CarBodyType {
  SEDAN = "SEDAN",
  SUV = "SUV", 
  CROSSOVER = "CROSSOVER",
  COUPE = "COUPE",
  HATCHBACK = "HATCHBACK",
  CONVERTIBLE = "CONVERTIBLE",
  WAGON = "WAGON",
  MINIBUS = "MINIBUS",
  ELECTRIC = "ELECTRIC", // Для электромобилей
}

export enum TransmissionType {
  MANUAL = "manual",
  AUTOMATIC = "automatic",
  CVT = "cvt",
  SEMI_AUTOMATIC = "semi_automatic",
}

import { UniqueIdentifier } from "./unique-identifier";

export interface IDeliveryCoordinates {
  latitude: number;
  longitude: number;
}

export interface ICar extends UniqueIdentifier {
  id: number;
  name: string;
  plate_number: string;
  latitude: number;
  longitude: number;
  course: number;
  fuel_level: number;
  price_per_minute: number;
  price_per_hour: number;
  price_per_day: number;
  engine_volume: number;
  year: number;
  drive_type: number;
  transmission_type: string | null;
  body_type: string;
  photos: string[];
  owner_id: number;
  current_renter_id: number | null;
  status: CarStatus;
  open_price: number;
  owned_car: boolean;
  rental_id: number;
  reservation_time?: string;
  description?: string;
  current_renter_details?: ICurrentRenterDetails;
  delivery_coordinates?: IDeliveryCoordinates;
  available_minutes?: number; // Добавляем поле для owned_cars
}

export interface ICurrentRenterDetails {
  full_name: string;
  phone_number: string;
  selfie_url: string;
  rent_selfie_url: string;
}
