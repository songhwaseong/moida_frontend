import { useSyncExternalStore } from 'react';
import { PRODUCT_DETAILS, AUCTION_DETAILS } from './mockData';

export type InquiryKind = 'product' | 'auction';

export interface InquiryAnswer {
  user: string;
  date: string;
  text: string;
}

export interface InquiryRecord {
  id: number;
  kind: InquiryKind;
  itemId: number;
  itemName: string;
  itemImage?: string;
  seller: string;
  user: string;
  date: string;
  question: string;
  answer: InquiryAnswer | null;
}

const lookup = (kind: InquiryKind, id: number) => {
  const list = kind === 'product' ? PRODUCT_DETAILS : AUCTION_DETAILS;
  const item = list.find(i => i.id === id);
  return {
    name: item?.name ?? '알 수 없는 상품',
    image: item?.images?.[0],
    seller: item?.seller ?? '판매자',
  };
};

const make = (
  id: number,
  kind: InquiryKind,
  itemId: number,
  user: string,
  date: string,
  question: string,
  answer: InquiryAnswer | null,
): InquiryRecord => {
  const meta = lookup(kind, itemId);
  return {
    id, kind, itemId,
    itemName: meta.name, itemImage: meta.image, seller: meta.seller,
    user, date, question, answer,
  };
};

const productSeed: InquiryRecord[] = [
  make(101, 'product', PRODUCT_DETAILS[0]?.id ?? 1, '구매희망자', '2일 전',
    '혹시 직거래도 가능한가요? 가능하시다면 어느 지역에서 가능하실까요?',
    { user: lookup('product', PRODUCT_DETAILS[0]?.id ?? 1).seller, date: '1일 전', text: '네, 강남역 근처에서 직거래 가능합니다. 시간 맞춰 메시지 주세요.' }),
  make(102, 'product', PRODUCT_DETAILS[0]?.id ?? 1, '관심있어요', '5시간 전',
    '상품 상태가 어떤지 궁금합니다. 사용감이나 흠집이 있나요?',
    { user: lookup('product', PRODUCT_DETAILS[0]?.id ?? 1).seller, date: '3시간 전', text: '거의 새것 수준이고 흠집이나 사용감은 거의 없습니다. 추가 사진 필요하시면 말씀해주세요.' }),
  make(103, 'product', PRODUCT_DETAILS[0]?.id ?? 1, '바자르유저', '1시간 전',
    '구성품에 박스랑 충전기 다 포함되나요?', null),
  make(104, 'product', PRODUCT_DETAILS[1]?.id ?? 2, '직장인A', '3일 전',
    '실착 사이즈가 표기 사이즈와 동일한가요?', null),
  make(105, 'product', PRODUCT_DETAILS[2]?.id ?? 3, '신규유저', '4시간 전',
    '쿠폰 적용 가능한가요?',
    { user: lookup('product', PRODUCT_DETAILS[2]?.id ?? 3).seller, date: '2시간 전', text: '쿠폰은 적용되지 않는 상품입니다. 양해 부탁드립니다.' }),
];

const auctionSeed: InquiryRecord[] = [
  make(201, 'auction', AUCTION_DETAILS[0]?.id ?? 1, '입찰관심', '1일 전',
    '시작가 외에 즉시낙찰가도 따로 정해두셨나요?',
    { user: lookup('auction', AUCTION_DETAILS[0]?.id ?? 1).seller, date: '1일 전', text: '네, 상품 정보에 표시된 즉시낙찰가로 즉시 거래도 가능합니다.' }),
  make(202, 'auction', AUCTION_DETAILS[0]?.id ?? 1, '경매유저', '6시간 전',
    '낙찰 후 배송 가능 지역이 어디까지인가요?',
    { user: lookup('auction', AUCTION_DETAILS[0]?.id ?? 1).seller, date: '4시간 전', text: '전국 택배 가능하며, 수도권은 직거래도 가능합니다.' }),
  make(203, 'auction', AUCTION_DETAILS[0]?.id ?? 1, '바자르유저', '30분 전',
    '구성품 중 누락된 부분이 있는지 확인 부탁드립니다.', null),
  make(204, 'auction', AUCTION_DETAILS[1]?.id ?? 2, '입찰러B', '2일 전',
    '연식과 사용 기간이 어떻게 되나요?', null),
];

// 로그인 사용자('나') 본인이 작성한 문의 — 마이페이지 > 내 문의에 노출
const mySeed: InquiryRecord[] = [
  make(301, 'product', PRODUCT_DETAILS[1]?.id ?? 2, '나', '4일 전',
    '결제 후 언제까지 발송 가능하신가요? 가급적 빠르게 받고 싶습니다.',
    { user: lookup('product', PRODUCT_DETAILS[1]?.id ?? 2).seller, date: '3일 전', text: '결제 확인 즉시 당일 발송 가능합니다. 오후 2시 이전 결제 시 당일, 이후엔 익일 발송됩니다.' }),
  make(302, 'product', PRODUCT_DETAILS[3]?.id ?? 4, '나', '1일 전',
    '교환·환불 정책이 어떻게 되나요? 사이즈 안 맞으면 교환 가능할까요?', null),
  make(303, 'auction', AUCTION_DETAILS[0]?.id ?? 1, '나', '7시간 전',
    '낙찰 후 결제 마감 기한이 어떻게 되나요?',
    { user: lookup('auction', AUCTION_DETAILS[0]?.id ?? 1).seller, date: '5시간 전', text: '낙찰 후 24시간 이내 결제 부탁드립니다. 미결제 시 자동 취소되며 페널티가 부과될 수 있어요.' }),
  make(304, 'auction', AUCTION_DETAILS[2]?.id ?? 3, '나', '20분 전',
    '실물 사진 추가로 받아볼 수 있을까요? 측면이랑 뒷면이 궁금합니다.', null),
];

let store: InquiryRecord[] = [...productSeed, ...auctionSeed, ...mySeed];
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(l => l());

export const getInquiries = () => store;

export const getInquiriesFor = (kind: InquiryKind, itemId: number) =>
  store.filter(i => i.kind === kind && i.itemId === itemId);

export const addInquiry = (kind: InquiryKind, itemId: number, user: string, question: string) => {
  const meta = lookup(kind, itemId);
  store = [
    {
      id: Date.now(),
      kind, itemId,
      itemName: meta.name, itemImage: meta.image, seller: meta.seller,
      user, date: '방금', question, answer: null,
    },
    ...store,
  ];
  emit();
};

export const setAnswer = (inquiryId: number, text: string) => {
  store = store.map(i => {
    if (i.id !== inquiryId) return i;
    return { ...i, answer: { user: i.seller, date: '방금', text } };
  });
  emit();
};

export const removeAnswer = (inquiryId: number) => {
  store = store.map(i => i.id === inquiryId ? { ...i, answer: null } : i);
  emit();
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};

export const useInquiries = (): InquiryRecord[] =>
  useSyncExternalStore(subscribe, getInquiries, getInquiries);
