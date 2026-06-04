import customAxios from './axiosInstance';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

const unwrap = <T>(response: { data: ApiResponse<T> }) => response.data.data;

/** 백엔드 AuctionStatus enum 이름. READY/AWAITING_PAYMENT 는 화면에서 직접 설정하지 않는다. */
export type AdminAuctionStatusEnum = 'READY' | 'LIVE' | 'AWAITING_PAYMENT' | 'SUCCESS' | 'FAILED' | 'CANCELED';

/** 화면 표시용 한글 상태 */
export type AdminAuctionStatusLabel = '대기' | '경매중' | '낙찰' | '유찰' | '취소';

export const STATUS_LABEL: Record<AdminAuctionStatusEnum, AdminAuctionStatusLabel> = {
  READY: '대기',
  LIVE: '경매중',
  // 결제 대기는 이미 낙찰이 확정된 단계이므로 상태 컬럼은 '낙찰'로 표기하고,
  // 세부 결제·배송 진행은 별도의 '진행상태' 컬럼에서 보여준다.
  AWAITING_PAYMENT: '낙찰',
  SUCCESS: '낙찰',
  FAILED: '유찰',
  CANCELED: '취소',
};

/** 백엔드 DeliveryStatus enum 이름. (낙찰 이후 배송 단계) */
export type AdminDeliveryStatusEnum = 'PAYMENT_COMPLETED' | 'SHIPMENT_NOTICE' | 'SHIPPING' | 'DELIVERED' | 'RECEIVED';

/** 낙찰 이후 결제·배송 진행 단계 라벨. (판매자 '내 등록 상품'과 동일한 6단계) */
export const PROGRESS_LABELS = ['낙찰자 결제대기', '결제완료', '발송알림', '배송중', '수령확인 대기', '정산완료'] as const;
export type AdminProgressLabel = typeof PROGRESS_LABELS[number];

/**
 * 경매 상태 + 배송 상태로 낙찰 이후 진행 단계를 도출한다.
 * 낙찰 전(경매중/유찰/취소 등)이면 진행상태가 없으므로 null 을 반환한다.
 */
export const toProgressLabel = (
  status: AdminAuctionStatusEnum,
  deliveryStatus: AdminDeliveryStatusEnum | null,
): AdminProgressLabel | null => {
  if (status === 'AWAITING_PAYMENT') return '낙찰자 결제대기';
  if (status === 'SUCCESS') {
    switch (deliveryStatus) {
      case 'RECEIVED': return '정산완료';
      case 'DELIVERED': return '수령확인 대기';
      case 'SHIPPING': return '배송중';
      case 'SHIPMENT_NOTICE': return '발송알림';
      default: return '결제완료';
    }
  }
  return null;
};

const LABEL_TO_ENUM: Record<AdminAuctionStatusLabel, AdminAuctionStatusEnum> = {
  '대기': 'READY',
  '경매중': 'LIVE',
  '낙찰': 'SUCCESS',
  '유찰': 'FAILED',
  '취소': 'CANCELED',
};

export const labelToEnum = (label: AdminAuctionStatusLabel) => LABEL_TO_ENUM[label];

export interface AdminAuctionDto {
  id: number;
  auctionNo: string;
  productId: number;
  productName: string;
  category: string;
  currentPrice: number;
  startPrice: number;
  bidCount: number;
  timeLeft: number;          // 종료까지 남은 초
  status: AdminAuctionStatusEnum;
  deliveryStatus: AdminDeliveryStatusEnum | null;  // 낙찰 이후 배송 단계 (없으면 null)
  startAt: string;
  endAt: string;
}

export interface AdminAuctionBidDto {
  id: number;
  user: string;
  memberNo: string;
  amount: number;
  time: string;
  isWinning: boolean;
}

// 경매 목록 조회
export const getAdminAuctions = async (): Promise<AdminAuctionDto[]> => {
  const response = await customAxios.get<ApiResponse<AdminAuctionDto[]>>('/admin/auctions');
  return unwrap(response);
};

// 입찰 내역 조회
export const getAdminAuctionBids = async (auctionId: number): Promise<AdminAuctionBidDto[]> => {
  const response = await customAxios.get<ApiResponse<AdminAuctionBidDto[]>>(`/admin/auctions/${auctionId}/bids`);
  return unwrap(response);
};

// 상태 변경. 한글 라벨을 받아 enum 으로 변환해 전송한다.
export const updateAdminAuctionStatus = async (auctionId: number, label: AdminAuctionStatusLabel): Promise<AdminAuctionDto> => {
  const response = await customAxios.patch<ApiResponse<AdminAuctionDto>>(
    `/admin/auctions/${auctionId}/status`,
    { status: labelToEnum(label) },
  );
  return unwrap(response);
};
