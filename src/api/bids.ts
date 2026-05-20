import customAxios from './axiosInstance';
import type { BidHistory } from '../types';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export interface BidResultDto {
  currentPrice: number;
  bidCount: number;
  isLive: boolean;
  bidHistory: BidHistory[];
}

export type BidType = 'NORMAL' | 'IMMEDIATE';

export const placeProductBid = async (
  productId: number,
  amount: number,
) => {
  const response = await customAxios.post<ApiResponse<BidResultDto>>(`/products/${productId}/bids`, {
    amount,
    bidType: 'NORMAL' satisfies BidType,
  });
  return response.data.data;
};

export const buyNowProduct = async (productId: number) => {
  const response = await customAxios.post<ApiResponse<BidResultDto>>(`/products/${productId}/bids/immediate`);
  return response.data.data;
};
