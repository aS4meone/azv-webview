import { RentalType } from "../dto/rent.dto";
import { ICar } from "./car";

export interface ICurrentRental {
  rental_details: RentalDetails;
  car_details: ICar;
  current_mechanic: null;
}

export interface RentalDetails {
  reservation_time: string;
  start_time: null | string;
  rental_type: RentalType;
  duration: null | number;
  already_payed: number;
  status: RentalStatus;
  delivery_in_progress: boolean;
}

export enum RentalStatus {
  RESERVED = "reserved",
  IN_USE = "in_use",
  COMPLETED = "completed",
  DELIVERING = "delivering",
  CANCELLED = "CANCELLED",
}
