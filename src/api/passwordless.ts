import customAxios from './axiosInstance';
import type { LoginResponse } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export interface PasswordlessLoginStartResponse {
  requestToken: string;
  sessionId: string;
  oneTimeToken: string;
  pushConnectorUrl: string;
  pushConnectorToken: string;
  expiresInSeconds: number;
}

export interface PasswordlessLoginCompleteResponse {
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  login: LoginResponse | null;
}

export interface PasswordlessStatusResponse {
  registered: boolean;
}

export interface PasswordlessRegistrationStartResponse {
  qr: string;
  corpId: string;
  registerKey: string;
  terms: number;
  serverUrl: string;
  userId: string;
  pushConnectorUrl: string;
  pushConnectorToken: string;
  expiresInSeconds: number;
}

export const startPasswordlessLogin = async (email: string) => {
  const response = await customAxios.post<ApiResponse<PasswordlessLoginStartResponse>>(
    '/auth/passwordless/login/start',
    { email }
  );
  return response.data.data;
};

export const completePasswordlessLogin = async (requestToken: string) => {
  const response = await customAxios.post<ApiResponse<PasswordlessLoginCompleteResponse>>(
    '/auth/passwordless/login/complete',
    { requestToken }
  );
  return response.data.data;
};

export const cancelPasswordlessLogin = async (requestToken: string) => {
  await customAxios.post<ApiResponse<null>>('/auth/passwordless/login/cancel', { requestToken });
};

export const getPasswordlessStatus = async () => {
  const response = await customAxios.get<ApiResponse<PasswordlessStatusResponse>>('/members/me/passwordless/status');
  return response.data.data;
};

export const startPasswordlessRegistration = async () => {
  const response = await customAxios.post<ApiResponse<PasswordlessRegistrationStartResponse>>(
    '/members/me/passwordless/registration/start'
  );
  return response.data.data;
};

export const confirmPasswordlessRegistration = async () => {
  const response = await customAxios.post<ApiResponse<PasswordlessStatusResponse>>(
    '/members/me/passwordless/registration/confirm'
  );
  return response.data.data;
};

export const withdrawPasswordless = async () => {
  await customAxios.delete<ApiResponse<null>>('/members/me/passwordless');
};
