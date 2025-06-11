import { ICar } from "./car";

export interface ICurrentRental {
  rental_details: {
    reservation_time: string;
    start_time: null;
    rental_type: string;
    duration: null;
    already_payed: number;
    status: string;
    delivery_in_progress: boolean;
  };
  car_details: ICar;
  current_mechanic: null;
}
