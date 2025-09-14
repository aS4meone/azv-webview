export type ContractType = "guarantor" | "sublease";

export interface GuarantorFormData {
  first_name: string;
  last_name: string;
  phone_number: string;
  reason?: string;
}

export interface GuarantorFormInputs {
  first_name: string;
  last_name: string;
  phone_number: string;
  reason?: string;
}

