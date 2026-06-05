import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

export interface AdminActionLogDto {
  id: number;
  adminId: number | null;
  adminEmail: string;
  actionType: string;
  targetType: string;
  targetId: number | null;
  targetName: string | null;
  beforeValue: string | null;
  afterValue: string | null;
  reason: string | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

export const getAdminActionLogs = async (): Promise<AdminActionLogDto[]> => {
  const res = await customAxios.get<ApiResponse<AdminActionLogDto[]>>('/admin/action-logs');
  return unwrap(res);
};
