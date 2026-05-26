import customAxios from './axiosInstance';
import type {
  BankAccountDto,
  WalletTransactionStatus,
  WalletTransactionType,
} from './wallet';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export interface AdminWalletTransactionDto {
  id: number;
  memberId: number;
  memberNo: string;
  memberName: string;
  memberEmail: string;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number;
  description: string;
  account: BankAccountDto | null;
  createdAt: string;
}

export interface AdminWalletTransactionQuery {
  type?: WalletTransactionType;
  status?: WalletTransactionStatus;
  size?: number;
}

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

export const getAdminWalletTransactions = async (query: AdminWalletTransactionQuery = {}) => {
  const response = await customAxios.get<ApiResponse<AdminWalletTransactionDto[]>>(
    '/admin/wallet/transactions',
    { params: query },
  );
  return unwrap(response);
};

export const confirmAdminDeposit = async (transactionId: number) => {
  const response = await customAxios.post<ApiResponse<unknown>>(
    `/admin/wallet/deposits/${transactionId}/confirm`,
  );
  return unwrap(response);
};

export const confirmAdminWithdrawal = async (transactionId: number) => {
  const response = await customAxios.post<ApiResponse<unknown>>(
    `/admin/wallet/withdrawals/${transactionId}/confirm`,
  );
  return unwrap(response);
};

export const cancelAdminDeposit = async (transactionId: number) => {
  const response = await customAxios.post<ApiResponse<unknown>>(
    `/admin/wallet/deposits/${transactionId}/cancel`,
  );
  return unwrap(response);
};

export const cancelAdminWithdrawal = async (transactionId: number) => {
  const response = await customAxios.post<ApiResponse<unknown>>(
    `/admin/wallet/withdrawals/${transactionId}/cancel`,
  );
  return unwrap(response);
};
