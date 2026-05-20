import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export interface InquiryResponseDto {
  id: number;
  productId: number;
  itemName: string;
  itemImage?: string | null;
  seller: string;
  user: string;
  date: string;
  question: string;
  answer?: string | null;
  answerDate?: string | null;
  isSecret: boolean;
}

export interface InquiryAnswerView {
  user: string;
  date: string;
  text: string;
}

export interface InquiryView {
  id: number;
  user: string;
  date: string;
  question: string;
  answer: InquiryAnswerView | null;
}

// Convert the backend inquiry DTO into the compact shape used by detail pages.
export const toInquiryView = (item: InquiryResponseDto): InquiryView => ({
  id: item.id,
  user: item.user,
  date: item.date,
  question: item.question,
  answer: item.answer
    ? {
        user: item.seller,
        date: item.answerDate ?? '',
        text: item.answer,
      }
    : null,
});

// Detail pages read persisted product inquiries from the backend instead of mock state.
export const getProductInquiries = async (productId: number): Promise<InquiryView[]> => {
  const response = await customAxios.get<ApiResponse<InquiryResponseDto[]>>(
    `/products/${productId}/inquiries`,
  );
  return response.data.data.map(toInquiryView);
};

// Creating an inquiry requires a logged-in user; auth is attached by axiosInstance.
export const createProductInquiry = async (
  productId: number,
  question: string,
): Promise<InquiryView> => {
  const response = await customAxios.post<ApiResponse<InquiryResponseDto>>(
    `/products/${productId}/inquiries`,
    { question },
  );
  return toInquiryView(response.data.data);
};
