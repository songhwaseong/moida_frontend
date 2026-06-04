import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

export type LoginResult = 'SUCCESS' | 'FAIL';

export interface AdminLoginLogDto {
  id: number;
  memberId: number | null;
  email: string;
  role: 'ADMIN' | 'MANAGER';
  ip: string | null;
  userAgent: string | null;
  result: LoginResult;
  loginAt: string;   // 'yyyy.MM.dd HH:mm:ss'
}

// 관리자 로그인 기록 조회 (ADMIN 전용)
export const getAdminLoginLogs = async (): Promise<AdminLoginLogDto[]> => {
  const res = await customAxios.get<ApiResponse<AdminLoginLogDto[]>>('/admin/login-logs');
  return unwrap(res);
};
