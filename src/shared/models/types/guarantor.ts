export interface SimpleGuarantor {
  id: string; // sid (short ID) - base64 encoded UUID
  first_name: string | null;
  last_name: string | null;
  phone: string;
  contract_signed: boolean;
  sublease_contract_signed: boolean;
  created_at: string;
}

export interface SimpleClient {
  id: string; // sid (short ID) - base64 encoded UUID
  first_name: string | null;
  last_name: string | null;
  phone: string;
  contract_signed: boolean;
  sublease_contract_signed: boolean;
  created_at: string;
}

export interface IncomingRequest {
  id: number; // Integer ID
  requestor_id: string; // sid (short ID) - base64 encoded UUID
  requestor_first_name: string;
  requestor_last_name: string;
  requestor_phone: string;
  reason?: string;
  created_at: string;
}

export enum GuarantorRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted", 
  REJECTED = "rejected",
  EXPIRED = "expired"
}

export enum VerificationStatus {
  NOT_VERIFIED = "not_verified",
  VERIFIED = "verified",
  REJECTED_BY_ADMIN = "rejected_by_admin"
}

export interface ClientGuarantorRequestItem {
  id: number; // Integer ID
  guarantor_id?: string; // sid (short ID) - base64 encoded UUID
  guarantor_first_name?: string;
  guarantor_last_name?: string;
  guarantor_phone?: string;
  status: GuarantorRequestStatus;
  verification_status: VerificationStatus;
  reason?: string;
  admin_notes?: string;
  created_at: string;
  responded_at?: string;
  verified_at?: string;
}

export interface ClientGuarantorRequestsResponse {
  total: number;
  items: ClientGuarantorRequestItem[];
}
