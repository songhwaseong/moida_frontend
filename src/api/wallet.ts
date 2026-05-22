import customAxios from './axiosInstance';

/**
 * API 공통 응답 포맷 인터페이스
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

/**
 * 출금 계좌 정보 인터페이스
 */
export interface BankAccountDto {
  bank: string;
  accountNumber: string;
  holder: string;
  verified: boolean;
}

/**
 * 지갑 및 계좌 정보, 최근 거래 내역을 포함하는 지갑 상세 데이터 인터페이스
 */
export interface WalletDto {
  balance: number;
  account: BankAccountDto | null;
  transactions: WalletTransactionDto[];
}

/** 거래 종류 (DEPOSIT: 입금, WITHDRAW: 출금) */
export type WalletTransactionType = 'DEPOSIT' | 'WITHDRAW';

/** 거래 상태 (COMPLETED: 완료, PENDING: 대기, CANCELED: 취소) */
export type WalletTransactionStatus = 'COMPLETED' | 'PENDING' | 'CANCELED';

/**
 * 단건 거래 내역 데이터 인터페이스
 */
export interface WalletTransactionDto {
  id: number;
  type: WalletTransactionType;
  status: WalletTransactionStatus;
  amount: number;
  description: string;
  createdAt: string;
}

/**
 * 출금 계좌 등록 및 변경 요청 데이터 인터페이스
 */
export interface BankAccountRequest {
  bank: string;
  accountNumber: string;
  holder: string;
}

/**
 * API 응답에서 실제 데이터(data.data)를 추출하는 헬퍼 함수
 */
const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

/**
 * 현재 로그인한 회원의 지갑 정보(잔액, 계좌, 최근 거래 내역)를 조회합니다.
 */
export const getWallet = async () => {
  const response = await customAxios.get<ApiResponse<WalletDto>>('/wallet');
  return unwrap(response);
};

/**
 * 지갑 충전을 요청합니다. (가상계좌 입금 대기 건 생성)
 */
export const depositWallet = async (amount: number) => {
  const response = await customAxios.post<ApiResponse<WalletDto>>('/wallet/deposits', {
    amount,
  });
  return unwrap(response);
};

/**
 * 지갑 잔액 출금을 신청합니다.
 */
export const withdrawWallet = async (amount: number) => {
  const response = await customAxios.post<ApiResponse<WalletDto>>('/wallet/withdrawals', {
    amount,
  });
  return unwrap(response);
};

/**
 * 회원의 출금 계좌 정보를 등록하거나 변경합니다.
 */
export const saveBankAccount = async (request: BankAccountRequest) => {
  const response = await customAxios.put<ApiResponse<WalletDto>>(
    '/wallet/account',
    request,
  );
  return unwrap(response);
};

/**
 * 등록된 출금 계좌 정보를 삭제합니다.
 */
export const deleteBankAccount = async () => {
  const response = await customAxios.delete<ApiResponse<WalletDto>>('/wallet/account');
  return unwrap(response);
};
