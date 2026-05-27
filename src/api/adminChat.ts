import customAxios from './axiosInstance';
import type { ProductChatMessage, ProductChatRoomStatus } from './chat';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

export interface AdminChatRoom {
  id: number;
  productId: number;
  productName: string;
  status: ProductChatRoomStatus;
  lastMessage?: string | null;
  messageCount: number;
  updatedAt: string;
}

// 관리자 채팅 기능: 방 목록 조회, 표시/쓰기 상태 변경,
// 메시지 숨김 처리를 담당한다.
export const getAdminChatRooms = async () => {
  const response = await customAxios.get<ApiResponse<AdminChatRoom[]>>('/admin/chat/rooms');
  return response.data.data;
};

export const updateAdminChatRoomStatus = async (roomId: number, status: ProductChatRoomStatus) => {
  const response = await customAxios.patch<ApiResponse<AdminChatRoom>>(
    `/admin/chat/rooms/${roomId}/status`,
    { status },
  );
  return response.data.data;
};

export const hideAdminChatMessage = async (messageId: number) => {
  const response = await customAxios.delete<ApiResponse<ProductChatMessage>>(
    `/admin/chat/messages/${messageId}`,
  );
  return response.data.data;
};
