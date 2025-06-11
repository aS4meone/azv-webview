export enum RentStatus {
  RESERVED = "reserved",
  IN_USE = "in_use",
  COMPLETED = "completed",
  DELIVERING = "delivering",
  CANCELLED = "CANCELLED",
}

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
}

import { UniqueIdentifier } from "./unique-identifier";

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
}
