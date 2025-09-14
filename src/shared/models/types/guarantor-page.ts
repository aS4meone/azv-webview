export type ContractType = "guarantor" | "sublease";

export interface GuarantorFormData {
  phone_number: string;
  reason?: string;
}

export interface GuarantorFormInputs {
  phone_number: string;
  reason?: string;
}

