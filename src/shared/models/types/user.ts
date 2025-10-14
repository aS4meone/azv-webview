import { ICar } from "./car";
import { ICurrentRental } from "./current-rental";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  REJECTED = "rejected",
  CLIENT = "client",
  PENDING = "pending",
  MECHANIC = "mechanic",
  PENDINGTOFIRST = "PENDINGTOFIRST",          // Загрузил документы, ждёт финансиста
  PENDINGTOSECOND = "PENDINGTOSECOND",        // Одобрен финансистом, ждёт МВД
  REJECTFIRSTDOC = "REJECTFIRSTDOC",          // Отказ финансиста: неверные документы
  REJECTFIRST = "REJECTFIRST",                 // Отказ финансиста: финансовые причины
  REJECTSECOND = "REJECTSECOND",               // Отказ МВД: полный блок
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

interface Application {
  financier_status: string | null;
  financier_reason: string | null;
  mvd_status: string | null;
  mvd_reason: string | null;
  reason: string | null;
}

export interface IUser {
  id: string; // sid (short ID) - base64 encoded UUID
  phone_number: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  role: UserRole;
  wallet_balance: number;
  current_rental: ICurrentRental | null;
  documents: Documents;
  application: Application;
  owned_cars: ICar[];
  unread_message: number;
  iin?: string | null;
  passport_number?: string | null;
  birth_date?: string | null;
  locale?: string;
  guarantors_count?: number;
  guarantors?: any[];
  auto_class?: string[];
}
