import { ICar } from "./car";
import { ICurrentRental } from "./current-rental";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  REJECTED = "rejected",
  FIRST = "first",
  PENDING = "pending",
  MECHANIC = "mechanic",
}

interface DriversLicense {
  url: string | null;
  expiry: string | null;
}

interface Documents {
  documents_verified: boolean;
  selfie_with_license_url: string | null;
  selfie_url: string | null;
  drivers_license: DriversLicense;
  id_card: IdCard;
}

interface IdCard {
  front_url: string | null;
  back_url: string | null;
  expiry: string | null;
}

export interface IUser {
  phone_number: string;
  full_name: string | null;
  role: UserRole;
  wallet_balance: number;
  current_rental: ICurrentRental | null;
  documents: Documents;
  owned_cars: ICar[];
}
