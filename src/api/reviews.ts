import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

export interface ReceivedReviewDto {
  id: number;
  reviewerNickname: string;
  reviewerAvatar: string | null;
  productId: number;
  productName: string;
  productImage: string | null;
  rating: number;
  content: string | null;
  mannerTempChange: number;
  createdAt: string;
}

export const getReceivedReviews = async (size = 50) => {
  const response = await customAxios.get<ApiResponse<ReceivedReviewDto[]>>('/members/me/reviews/received', {
    params: { size },
  });
  return unwrap(response);
};

export interface CreateReviewPayload {
  productId: number;
  rating: number;        // 1~5
  content?: string;
}

// 구매자(낙찰자)가 수령확인을 마친 거래에 대해 판매자 후기를 작성한다.
export const createReview = async (payload: CreateReviewPayload) => {
  const response = await customAxios.post<ApiResponse<number>>('/members/me/reviews', payload);
  return unwrap(response);
};
