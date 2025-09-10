export enum GuarantorRequestStatus {
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export interface GuarantorInfo {
  full_name: string;
  phone_number: string;
}

export interface GuarantorRequestCreate {
  guarantor_info: GuarantorInfo;
  reason?: string;
}

export interface GuarantorRequestResponse {
  accept: boolean;
  rejection_reason?: string;
}

export interface GuarantorRequest {
  id: number;
  requestor_id: number;
  guarantor_id: number;
  status: GuarantorRequestStatus;
  reason?: string;
  created_at: string;
  responded_at?: string;
  requestor_name?: string;
  requestor_phone: string;
  guarantor_name?: string;
  guarantor_phone: string;
}

export interface Guarantor {
  id: number;
  guarantor_id: number;
  client_id: number;
  contract_signed: boolean;
  sublease_contract_signed: boolean;
  is_active: boolean;
  created_at: string;
  guarantor_name?: string;
  guarantor_phone: string;
  client_name?: string;
  client_phone: string;
}

export interface SimpleGuarantor {
  id: number;
  name: string;
  phone: string;
  contract_signed: boolean;
  sublease_contract_signed: boolean;
  created_at: string;
}

export interface SimpleClient {
  id: number;
  name: string;
  phone: string;
  contract_signed: boolean;
  sublease_contract_signed: boolean;
  created_at: string;
}

export interface IncomingRequest {
  id: number;
  requestor_id: number;
  requestor_name: string;
  requestor_phone: string;
  reason?: string;
  created_at: string;
}

export interface ContractFile {
  id: number;
  contract_type: string;
  file_name: string;
  file_path: string;
  uploaded_at: string;
  is_active: boolean;
}

export interface ContractList {
  guarantor_contracts: ContractFile[];
  sublease_contracts: ContractFile[];
}

export interface ContractDownload {
  id: number;
  contract_type: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  is_active: boolean;
}

export interface ContractSign {
  contract_type: "guarantor" | "sublease";
}

export interface InviteGuarantorResponse {
  message: string;
  user_exists: boolean;
  request_id: number;
  sms_result?: any;
  guarantor_name?: string;
}

export interface AcceptGuarantorResponse {
  message: string;
  guarantor_relationship_id: number;
}

export interface MessageResponse {
  message: string;
}

export interface GuarantorRelationshipsSummary {
  requests_sent: number;
  requests_received: number;
  active_clients: number;
  active_guarantors: number;
}

export interface GuarantorRelationshipsDetails {
  sent_requests: Array<{
    id: number;
    guarantor_phone?: string;
    guarantor_name?: string;
    guarantor_id?: number;
    status: string;
    created_at: string;
  }>;
  received_requests: Array<{
    id: number;
    requestor_id: number;
    status: string;
    created_at: string;
  }>;
  my_clients: Array<{
    id: number;
    client_id?: number;
    created_at: string;
    contract_signed: boolean;
  }>;
  my_guarantors: Array<{
    id: number;
    guarantor_id?: number;
    created_at: string;
    contract_signed: boolean;
  }>;
}

export interface GuarantorRelationships {
  user_id: number;
  user_phone: string;
  summary: GuarantorRelationshipsSummary;
  details: GuarantorRelationshipsDetails;
}

export interface GuarantorInfoSchema {
  title: string;
  description: string;
  details: string[];
}
