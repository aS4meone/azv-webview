export type ContractType = "guarantor" | "sublease";

export interface GuarantorFormData {
  full_name: string;
  phone_number: string;
  reason?: string;
}
