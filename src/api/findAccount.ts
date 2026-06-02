import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export interface FindIdResult {
  maskedEmail: string;
  joinedAt?: string;
}

export const sendFindIdPhoneCode = async (name: string, phone: string) => {
  await customAxios.post<ApiResponse<null>>('/auth/find-id/send-code', { name, phone });
};

export const findIdByVerifiedPhone = async (name: string, phone: string) => {
  const response = await customAxios.post<ApiResponse<FindIdResult>>('/auth/find-id', { name, phone });
  return response.data.data;
};
