import axiosInstance from "../axios";

export const guarantorRoutes = {
  invite: "/guarantor/invite",
  accept: (id: number) => `/guarantor/${id}/accept`,
  reject: (id: number) => `/guarantor/${id}/reject`,
  myGuarantors: "/guarantor/my_guarantors",
  myGuarantorRequests: "/guarantor/my_guarantor_requests",
  incoming: "/guarantor/incoming",
  myClients: "/guarantor/my_clients",
  contracts: "/guarantor/contracts",
  guarantorContract: "/guarantor/contracts/guarantor",
  subleaseContract: "/guarantor/contracts/sublease",
  signContract: "/guarantor/contracts/sign",
  dashboard: "/guarantor/dashboard",
};

export interface GuarantorInfo {
  first_name: string;
  last_name: string;
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

export interface SimpleGuarantor {
  id: number;
  first_name: string | null;
  last_name: string | null;
  phone: string;
  contract_signed: boolean;
  sublease_contract_signed: boolean;
  created_at: string;
}

export interface SimpleClient {
  id: number;
  first_name: string | null;
  last_name: string | null;
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
  id: number;
  guarantor_id?: number;
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

export const guarantorApi = {
  // Пригласить гаранта
  inviteGuarantor: async (data: GuarantorRequestCreate) => {
    try {
      const response = await axiosInstance.post<InviteGuarantorResponse>(
        guarantorRoutes.invite,
        data
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to invite guarantor",
        statusCode: error.response?.status,
      };
    }
  },

  // Принять заявку на роль гаранта
  acceptGuarantorRequest: async (id: number) => {
    try {
      const response = await axiosInstance.post<AcceptGuarantorResponse>(
        guarantorRoutes.accept(id)
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to accept guarantor request",
        statusCode: error.response?.status,
      };
    }
  },

  // Отклонить заявку на роль гаранта
  rejectGuarantorRequest: async (id: number, rejectionReason?: string) => {
    try {
      const response = await axiosInstance.post<MessageResponse>(
        guarantorRoutes.reject(id),
        { rejection_reason: rejectionReason }
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to reject guarantor request",
        statusCode: error.response?.status,
      };
    }
  },

  // Получить моих гарантов
  getMyGuarantors: async () => {
    try {
      const response = await axiosInstance.get<SimpleGuarantor[]>(
        guarantorRoutes.myGuarantors
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to get my guarantors",
        statusCode: error.response?.status,
      };
    }
  },

  // Получить мои заявки на гарантов
  getMyGuarantorRequests: async () => {
    try {
      const response = await axiosInstance.get<ClientGuarantorRequestsResponse>(
        guarantorRoutes.myGuarantorRequests
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to get my guarantor requests",
        statusCode: error.response?.status,
      };
    }
  },

  // Получить входящие заявки (Я гарант)
  getIncomingRequests: async () => {
    try {
      const response = await axiosInstance.get<IncomingRequest[]>(
        guarantorRoutes.incoming
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to get incoming requests",
        statusCode: error.response?.status,
      };
    }
  },

  // Получить моих клиентов (за которых я ручаюсь)
  getMyClients: async () => {
    try {
      const response = await axiosInstance.get<SimpleClient[]>(
        guarantorRoutes.myClients
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to get my clients",
        statusCode: error.response?.status,
      };
    }
  },

  // Получить список договоров
  getContracts: async () => {
    try {
      const response = await axiosInstance.get<ContractList>(
        guarantorRoutes.contracts
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to get contracts",
        statusCode: error.response?.status,
      };
    }
  },

  // Получить договор гаранта
  getGuarantorContract: async () => {
    try {
      const response = await axiosInstance.get<ContractDownload>(
        guarantorRoutes.guarantorContract
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to get guarantor contract",
        statusCode: error.response?.status,
      };
    }
  },

  // Получить договор субаренды
  getSubleaseContract: async () => {
    try {
      const response = await axiosInstance.get<ContractDownload>(
        guarantorRoutes.subleaseContract
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to get sublease contract",
        statusCode: error.response?.status,
      };
    }
  },

  // Подписать договор
  signContract: async (contractType: "guarantor" | "sublease", guarantorRelationshipId: number) => {
    try {
      const response = await axiosInstance.post<MessageResponse>(
        guarantorRoutes.signContract,
        { 
          contract_type: contractType,
          guarantor_relationship_id: guarantorRelationshipId
        }
      );
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to sign contract",
        statusCode: error.response?.status,
      };
    }
  },

  // Получить дашборд гаранта
  getDashboard: async () => {
    try {
      const response = await axiosInstance.get(guarantorRoutes.dashboard);
      return { data: response.data, error: null, statusCode: response.status };
    } catch (error: any) {
      return {
        data: null,
        error: error.response?.data?.detail || "Failed to get guarantor dashboard",
        statusCode: error.response?.status,
      };
    }
  },
};

