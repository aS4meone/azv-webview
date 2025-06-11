export type RentalType = "minutes" | "hours" | "days";

export interface RentCarDto {
  carId: number;
  rentalType: RentalType;
  duration?: number;
}

export interface CompleteRentDto {
  rating: number;
  comment: string;
}
