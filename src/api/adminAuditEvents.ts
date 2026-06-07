import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export type AdminAuditEventAction = 'ADMIN_LOGOUT' | 'ADMIN_IDLE_TIMEOUT';

export const recordAdminAuditEvent = async (
  actionType: AdminAuditEventAction,
  reason: string,
): Promise<void> => {
  await customAxios.post<ApiResponse<unknown>>('/admin/audit-events', {
    actionType,
    reason,
  });
};
