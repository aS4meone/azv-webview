import { ICar } from "./car";

export interface ICurrentRental {
  rental_details: RentalDetails;
  car_details: ICar;
  current_mechanic: null;
}

export interface RentalDetails {
  reservation_time: string;
  start_time: null | string;
  rental_type: string;
  duration: null | number;
  already_payed: number;
  status: string;
  delivery_in_progress: boolean;
}
