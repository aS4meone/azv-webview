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
}

export interface ICurrentRenterDetails {
  full_name: string;
  phone_number: string;
  selfie_url: string;
  rent_selfie_url: string;
}
