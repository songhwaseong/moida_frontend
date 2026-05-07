export interface Review {
  id: number;
  user: string;
  date: string;
  stars: number;
  text: string;
  product: string;
}

// 초기 mock 데이터 (ReceivedReviewsPage와 동일)
export const reviewStore: Review[] = [
  { id: 1, user: '운동화마니아', date: '2026.04.20', stars: 5, text: '친절하고 물건 상태도 완벽했어요! 포장도 꼼꼼하게 해주셔서 감동받았습니다 ☺️', product: '샤넬 클래식 플랩백' },
  { id: 2, user: '코딩러버',   date: '2026.04.15', stars: 4, text: '거래가 빠르고 매너가 좋으셨어요. 상품도 설명과 동일했습니다.', product: 'LG 27인치 모니터' },
  { id: 3, user: '게임왕',     date: '2026.04.10', stars: 5, text: '직거래도 친절하게 응해주셔서 좋았어요! 다음에도 거래하고 싶어요.', product: 'PS5 디스크 에디션' },
];

export const addReview = (review: Omit<Review, 'id'>) => {
  const newReview: Review = { ...review, id: Date.now() };
  reviewStore.unshift(newReview);
  return newReview;
};
