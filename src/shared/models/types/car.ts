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
  occupied = "OCCUPIED",
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
  OCCUPIED = "OCCUPIED", // Занятые машины
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

export interface ILastClientReview {
  rating: number;
  comment: string | null;
  photos_after?: {
    interior: string[];
    exterior: string[];
  };
}

export interface ICar extends UniqueIdentifier {
  id: number; // Car ID is Integer
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
  owner_id: string; // sid (short ID) - base64 encoded UUID
  current_renter_id: string | null; // sid (short ID) - base64 encoded UUID
  status: CarStatus;
  open_price: number;
  owned_car: boolean;
  rental_id: string; // sid (short ID) - base64 encoded UUID
  reservation_time?: string;
  description?: string;
  current_renter_details?: ICurrentRenterDetails;
  delivery_coordinates?: IDeliveryCoordinates;
  available_minutes?: number;
  last_client_review?: ILastClientReview;
  photo_before_selfie_uploaded?: boolean;
  photo_before_car_uploaded?: boolean;
  photo_before_interior_uploaded?: boolean;
  photo_after_selfie_uploaded?: boolean;
  photo_after_car_uploaded?: boolean;
  photo_after_interior_uploaded?: boolean;
}

export interface ICurrentRenterDetails {
  id: string; // sid (short ID) - base64 encoded UUID
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone_number: string;
  selfie_url: string;
  rent_selfie_url: string;
}
