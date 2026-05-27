import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export type ProductChatRoomStatus = 'ACTIVE' | 'READ_ONLY' | 'HIDDEN';

export interface ProductChatMessage {
  id: number;
  roomId: number;
  productId: number;
  roomStatus: ProductChatRoomStatus;
  senderId: number;
  senderName: string;
  seller: boolean;
  mine: boolean;
  content: string;
  deleted: boolean;
  createdAt: string;
}

export interface ProductChatMessagesResponse {
  roomStatus: ProductChatRoomStatus;
  messages: ProductChatMessage[];
}

// 채팅 최초 조회: 최근 메시지와 실제 방 상태를 함께 받아
// 상품/경매가 종료된 경우 상세 화면을 읽기 전용으로 전환한다.
export const getProductChatMessages = async (productId: number, size = 50) => {
  const response = await customAxios.get<ApiResponse<ProductChatMessagesResponse>>(
    `/products/${productId}/chat/messages`,
    { params: { size } },
  );
  return response.data.data;
};

// STOMP 소켓이 재연결 중일 때 사용할 REST 전송 fallback이다.
export const createProductChatMessage = async (productId: number, content: string) => {
  const response = await customAxios.post<ApiResponse<ProductChatMessage>>(
    `/products/${productId}/chat/messages`,
    { content },
  );
  return response.data.data;
};
