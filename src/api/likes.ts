import customAxios from './axiosInstance';
import type { ProductSummaryDto } from './products';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export interface ToggleLikeResult {
  liked: boolean;
  likeCount: number;
}

export const toggleLike = async (productId: number): Promise<ToggleLikeResult> => {
  const response = await customAxios.post<ApiResponse<ToggleLikeResult>>(
    `/products/${productId}/like`,
  );
  return response.data.data;
};

export const getMyLikes = async (): Promise<ProductSummaryDto[]> => {
  const response = await customAxios.get<ApiResponse<ProductSummaryDto[]>>('/products/likes');
  return response.data.data;
};
