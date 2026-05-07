export interface Report {
  id: number;
  type: 'product' | 'chat' | 'review';
  targetId: number;
  targetName: string;
  reporterNo: string;
  reporterName: string;
  targetUserNo: string;
  targetUserName: string;
  reason: string;
  detail: string;
  status: 'pending' | 'approved' | 'rejected' | 'deleted';
  createdAt: string;
}

export interface Sanction {
  id: number;
  memberNo: string;
  memberName: string;
  type: 'warning' | 'suspend_7' | 'suspend_30' | 'permanent';
  reason: string;
  adminNote: string;
  createdAt: string;
  expiresAt?: string;
}

export interface SuspiciousCase {
  id: number;
  memberNo: string;
  memberName: string;
  caseType: 'bid_manipulation' | 'duplicate_account' | 'fake_review' | 'fraud';
  description: string;
  detectedAt: string;
  status: 'open' | 'investigating' | 'resolved';
  severity: 'high' | 'medium' | 'low';
}

export interface ChatLog {
  id: number;
  reportId: number;
  roomId: string;
  participants: string[];
  messages: { sender: string; text: string; time: string }[];
  reportReason: string;
}

export const REPORTS: Report[] = [
  {
    id: 1, type: 'product', targetId: 3, targetName: '무인양품 3인용 소파',
    reporterNo: '2024031500001', reporterName: '김철수',
    targetUserNo: '2024031500003', targetUserName: '이영희',
    reason: '허위 상품 정보', detail: '사진과 실제 상품 상태가 다릅니다. 사진은 새 제품이지만 실제 배송된 상품에는 큰 기스가 있었습니다.',
    status: 'pending', createdAt: '2026.04.28 14:23',
  },
  {
    id: 2, type: 'chat', targetId: 102, targetName: '채팅방 #102',
    reporterNo: '2024040100007', reporterName: '박지영',
    targetUserNo: '2024040100009', targetUserName: '최민준',
    reason: '사기 의심', detail: '입금 확인 후 상품을 보내준다고 했으나 입금 후 연락이 두절됐습니다. 50만원 사기를 당했습니다.',
    status: 'pending', createdAt: '2026.04.28 11:05',
  },
  {
    id: 3, type: 'review', targetId: 55, targetName: '거래 후기 #55',
    reporterNo: '2024050100011', reporterName: '정수민',
    targetUserNo: '2024050100013', targetUserName: '강동원',
    reason: '허위 후기', detail: '거래한 적도 없는 사람이 허위로 나쁜 후기를 남겼습니다.',
    status: 'pending', createdAt: '2026.04.27 19:40',
  },
  {
    id: 4, type: 'product', targetId: 49, targetName: '나이키 x 오프화이트 더텐 에어맥스 97',
    reporterNo: '2024062000021', reporterName: '윤서현',
    targetUserNo: '2024062000024', targetUserName: '한지훈',
    reason: '가품 의심', detail: '박스 태그와 내부 라벨이 정품과 다릅니다. 정품 인증서도 없습니다.',
    status: 'approved', createdAt: '2026.04.26 10:15',
  },
  {
    id: 5, type: 'chat', targetId: 203, targetName: '채팅방 #203',
    reporterNo: '2024070100025', reporterName: '임채원',
    targetUserNo: '2024070100027', targetUserName: '오준혁',
    reason: '욕설 및 협박', detail: '가격 흥정 중 욕설과 협박을 받았습니다. 스크린샷 첨부했습니다.',
    status: 'rejected', createdAt: '2026.04.25 16:30',
  },
  {
    id: 6, type: 'product', targetId: 22, targetName: '셀린느 클래식 박스 스몰 블랙',
    reporterNo: '2024080100028', reporterName: '송하은',
    targetUserNo: '2024080100030', targetUserName: '류지호',
    reason: '가품 의심', detail: '스티칭 패턴과 로고 각인이 정품과 다릅니다.',
    status: 'pending', createdAt: '2026.04.29 09:12',
  },
  {
    id: 7, type: 'review', targetId: 77, targetName: '거래 후기 #77',
    reporterNo: '2024090100034', reporterName: '권나영',
    targetUserNo: '2024090100036', targetUserName: '백승우',
    reason: '개인정보 포함', detail: '후기에 제 전화번호가 무단으로 공개됐습니다.',
    status: 'pending', createdAt: '2026.04.29 13:44',
  },
];

export const SANCTIONS: Sanction[] = [
  {
    id: 1, memberNo: '2024040100009', memberName: '최민준',
    type: 'permanent', reason: '사기 행위 (50만원 미입금)',
    adminNote: '피해자 신고 후 조사 완료. 입금 내역 없음 확인.',
    createdAt: '2026.04.28 15:30',
  },
  {
    id: 2, memberNo: '2024062000024', memberName: '한지훈',
    type: 'suspend_30', reason: '가품 판매 (오프화이트 나이키)',
    adminNote: '정품 감정 결과 가품 확인. 30일 정지 및 상품 삭제.',
    createdAt: '2026.04.26 14:00', expiresAt: '2026.05.26',
  },
  {
    id: 3, memberNo: '2024091500038', memberName: '폰러버2',
    type: 'warning', reason: '허위 상품 정보 등록',
    adminNote: '1차 경고 처리. 재발 시 계정 정지.',
    createdAt: '2026.04.20 10:00',
  },
  {
    id: 4, memberNo: '2024031500002', memberName: '이영희',
    type: 'warning', reason: '허위 후기 작성 신고 접수',
    adminNote: '경고 1회 부여. 추가 위반 시 정지 예정.',
    createdAt: '2026.04.15 11:20',
  },
  {
    id: 5, memberNo: '2025011500234', memberName: '김민준',
    type: 'suspend_7', reason: '반복 입찰 취소 (3회 이상)',
    adminNote: '7일 정지. 추가 시 30일 정지.',
    createdAt: '2026.04.28 16:00', expiresAt: '2026.05.05',
  },
  {
    id: 6, memberNo: '2024112800778', memberName: '정도윤',
    type: 'warning', reason: '허위 계정 의심 입찰 행위',
    adminNote: '경고 조치. 계정 모니터링 강화.',
    createdAt: '2026.04.24 09:30',
  },
  {
    id: 7, memberNo: '2024070100027', memberName: '오준혁',
    type: 'suspend_7', reason: '욕설 및 협박 채팅',
    adminNote: '신고 내용 확인 후 7일 정지 조치.',
    createdAt: '2026.04.25 17:00', expiresAt: '2026.05.02',
  },
  {
    id: 8, memberNo: '2024050100013', memberName: '강동원',
    type: 'warning', reason: '타인 개인정보 무단 공개',
    adminNote: '후기에 전화번호 공개. 경고 및 게시물 삭제.',
    createdAt: '2026.04.10 14:00',
  },
  {
    id: 9, memberNo: '2024082000032', memberName: '청소러버2',
    type: 'permanent', reason: '다중 거래 미발송 사기 (피해액 180만원)',
    adminNote: '피해자 3인 신고. 조사 완료 후 영구 정지.',
    createdAt: '2026.04.26 12:00',
  },
  {
    id: 10, memberNo: '2024100100041', memberName: '스니커즈1',
    type: 'suspend_7', reason: '제재 계정 재가입 시도',
    adminNote: '기기 핑거프린트 동일 확인. 7일 정지.',
    createdAt: '2026.04.28 23:59', expiresAt: '2026.05.05',
  },
  {
    id: 11, memberNo: '2025030601102', memberName: '박지훈',
    type: 'suspend_30', reason: '낙찰 후 결제 미이행 3회',
    adminNote: '3회 누적 미이행. 30일 정지 조치.',
    createdAt: '2026.04.26 18:00', expiresAt: '2026.05.26',
  },
  {
    id: 12, memberNo: '2024071200456', memberName: '최수아',
    type: 'warning', reason: '단시간 연속 입찰 (비정상 패턴)',
    adminNote: '1차 경고. 이상 행동 지속 시 정지 예정.',
    createdAt: '2026.04.25 11:30',
  },
  {
    id: 13, memberNo: '2024080100030', memberName: '류지호',
    type: 'warning', reason: '가품 의심 상품 등록',
    adminNote: '경고 조치 후 해당 상품 숨김 처리.',
    createdAt: '2026.04.01 10:00',
  },
];

export const SUSPICIOUS_CASES: SuspiciousCase[] = [
  {
    id: 1, memberNo: '2024031500002', memberName: '입찰자2',
    caseType: 'bid_manipulation',
    description: '동일 IP에서 자신의 경매에 반복 입찰 패턴 감지 (24시간 내 5회 이상)',
    detectedAt: '2026.04.29 08:15', status: 'investigating', severity: 'high',
  },
  {
    id: 2, memberNo: '2024100100041', memberName: '스니커즈1',
    caseType: 'duplicate_account',
    description: '기기 핑거프린트 중복. 제재된 계정(최민준)과 동일 기기에서 가입 시도',
    detectedAt: '2026.04.28 22:40', status: 'open', severity: 'high',
  },
  {
    id: 3, memberNo: '2024050100012', memberName: '사진작가2',
    caseType: 'fake_review',
    description: '단기간(3일) 내 동일 판매자에게 후기 8건 집중. 비정상 패턴.',
    detectedAt: '2026.04.27 14:20', status: 'open', severity: 'medium',
  },
  {
    id: 4, memberNo: '2024082000032', memberName: '청소러버2',
    caseType: 'fraud',
    description: '3건의 거래에서 상품 미발송 패턴. 피해액 합산 약 180만원.',
    detectedAt: '2026.04.26 11:00', status: 'resolved', severity: 'high',
  },
];

export const CHAT_LOGS: ChatLog[] = [
  {
    id: 1, reportId: 2, roomId: '102',
    participants: ['박지영 (2024040100007)', '최민준 (2024040100009)'],
    reportReason: '사기 의심',
    messages: [
      { sender: '박지영', text: '안녕하세요, 소니 카메라 아직 판매 중인가요?', time: '04.27 10:12' },
      { sender: '최민준', text: '네 판매 중입니다. 상태 최상이에요.', time: '04.27 10:14' },
      { sender: '박지영', text: '직거래 가능한가요?', time: '04.27 10:15' },
      { sender: '최민준', text: '죄송하게도 지방이라 택배만 가능합니다. 입금 확인 후 바로 발송해드릴게요.', time: '04.27 10:18' },
      { sender: '박지영', text: '알겠습니다. 계좌번호 알려주세요.', time: '04.27 10:20' },
      { sender: '최민준', text: '국민은행 123-456-789012 최민준입니다.', time: '04.27 10:21' },
      { sender: '박지영', text: '입금했습니다. 확인해주세요.', time: '04.27 10:45' },
      { sender: '최민준', text: '...', time: '04.27 10:46' },
      { sender: '박지영', text: '발송 언제 해주시나요?', time: '04.27 14:00' },
      { sender: '박지영', text: '연락 주세요 부탁드립니다', time: '04.27 18:30' },
      { sender: '박지영', text: '신고하겠습니다', time: '04.28 09:00' },
    ],
  },
  {
    id: 2, reportId: 5, roomId: '203',
    participants: ['임채원 (2024070100025)', '오준혁 (2024070100027)'],
    reportReason: '욕설 및 협박',
    messages: [
      { sender: '임채원', text: '안녕하세요 가격 좀 더 내려주실 수 있나요?', time: '04.25 15:10' },
      { sender: '오준혁', text: '안됩니다. 적정가입니다.', time: '04.25 15:12' },
      { sender: '임채원', text: '10만원만요 ㅠㅠ', time: '04.25 15:13' },
      { sender: '오준혁', text: '[욕설 포함 메시지 - 내용 검열됨]', time: '04.25 15:15' },
      { sender: '오준혁', text: '다시 연락하면 집 찾아간다', time: '04.25 15:16' },
      { sender: '임채원', text: '신고할게요', time: '04.25 15:17' },
    ],
  },
];
