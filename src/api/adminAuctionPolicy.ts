import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

export interface AuctionPolicyDto {
  durationMinutes: number;  // 총 분
  days: number;
  hours: number;
  minutes: number;
}

export interface AuctionPolicyUpdatePayload {
  days: number;
  hours: number;
  minutes: number;
}

export const getAdminAuctionPolicy = async (): Promise<AuctionPolicyDto> => {
  const res = await customAxios.get<ApiResponse<AuctionPolicyDto>>('/admin/auction-policy');
  return unwrap(res);
};

export const updateAdminAuctionPolicy = async (payload: AuctionPolicyUpdatePayload): Promise<AuctionPolicyDto> => {
  const res = await customAxios.patch<ApiResponse<AuctionPolicyDto>>('/admin/auction-policy', payload);
  return unwrap(res);
};
