import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

// 인증번호 발송 요청
export const sendPhoneCode = async (phone: string) => {
  await customAxios.post<ApiResponse<null>>('/auth/phone/send', { phone });
};

// 인증번호 검증
export const verifyPhoneCode = async (phone: string, code: string) => {
  await customAxios.post<ApiResponse<null>>('/auth/phone/verify', { phone, code });
};
