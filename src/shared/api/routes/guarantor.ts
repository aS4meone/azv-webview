import axiosInstance from "../axios";

export const guarantorRoutes = {
  invite: "/guarantor/invite",
  accept: (id: number) => `/guarantor/${id}/accept`,
  reject: (id: number) => `/guarantor/${id}/reject`,
  myGuarantors: "/guarantor/my_guarantors",
  incoming: "/guarantor/incoming",
  myClients: "/guarantor/my_clients",
  contracts: "/guarantor/contracts",
  guarantorContract: "/guarantor/contracts/guarantor",
  subleaseContract: "/guarantor/contracts/sublease",
  signContract: "/guarantor/contracts/sign",
  dashboard: "/guarantor/dashboard",
};

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
  signContract: async (contractType: "guarantor" | "sublease") => {
    try {
      const response = await axiosInstance.post<MessageResponse>(
        guarantorRoutes.signContract,
        { contract_type: contractType }
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
