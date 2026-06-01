import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { PRODUCTS, AUCTION_ITEMS } from '../../data/mockData';
import { myProductStore } from '../../data/myProductStore';
import DashboardPage from './DashboardPage';
import NoticePage from './NoticePage';
import BannerPage from './BannerPage';
import SettlementPage from './SettlementPage';
import WalletRequestPage from './WalletRequestPage';
import InquiryPage from './InquiryPage';
import InquiryProductPage from './InquiryProductPage';
import { useInquiries } from '../../data/inquiries';
import FalseBidPage from './FalseBidPage';
import SanctionPage from './SanctionPage';
import ChatLogPage from './ChatLogPage';
import MemberListPage from './MemberListPage';
import WithdrawnMemberPage from './WithdrawnMemberPage';
import AdminSettingsPage from './AdminSettingsPage';
import AuctionManagePage from './AuctionManagePage';
import { IDLE_OPTIONS, type IdleMinutes } from './adminSettingsOptions';
import styles from './AdminPage.module.css';

// ─── 관리자용 통합 상품 타입 ───────────────────────────────────────────
type TradeStatus = '경매예정' | '승인요청중' | '낙찰' | '숨김';
type AuctionStatus = '경매중' | '낙찰' | '유찰' | '숨김';
type ProductStatus = TradeStatus | AuctionStatus;

interface AdminProduct {
  id: string;
  productNo: string;
  image: string;
  name: string;
  type: '중고거래' | '경매';
  seller: string;
  category: string;
  condition: string;
  price: number;
  status: ProductStatus;
  registeredAt: string;
}

const SELLERS = ['운동화마니아', '코딩러버', '사진작가K', '기타리스트', '워치컬렉터', '뷰티러버', '패션킹', '게이머Z', '오디오파일', '홈퍼니싱'];
const getSeller = (id: number) => SELLERS[id % SELLERS.length];

const YY = String(new Date().getFullYear()).slice(2);
const makeProductNo = (seq: number) => `${YY}${String(seq).padStart(5, '0')}`;

const buildInitialProducts = (): AdminProduct[] => {
  const tradeItems: AdminProduct[] = PRODUCTS.map((p, i) => ({
    id: `trade-${p.id}`,
    productNo: makeProductNo(i + 1),
    image: p.image,
    name: p.name,
    type: '중고거래',
    seller: getSeller(p.id),
    category: p.category,
    condition: p.condition,
    price: p.price,
    status: '경매예정',
    registeredAt: `2026.04.${String(28 - (p.id % 14)).padStart(2, '0')}`,
  }));

  const auctionStatus = (a: { isLive: boolean; id: number }): AuctionStatus => {
    if (a.isLive) return '경매중';
    return a.id % 3 === 0 ? '유찰' : '낙찰';
  };

  const auctionItems: AdminProduct[] = AUCTION_ITEMS.map((a, i) => ({
    id: `auction-${a.id}`,
    productNo: makeProductNo(PRODUCTS.length + i + 1),
    image: a.image,
    name: a.name,
    type: '경매',
    seller: getSeller(a.id + 3),
    category: a.category,
    condition: a.condition ?? 'S급',
    price: a.currentPrice,
    status: auctionStatus(a),
    registeredAt: `2026.04.${String(27 - (a.id % 12)).padStart(2, '0')}`,
  }));

  const myItems: AdminProduct[] = myProductStore.map((p, i) => ({
    id: `my-${p.id}`,
    productNo: makeProductNo(PRODUCTS.length + AUCTION_ITEMS.length + i + 1),
    image: p.images[p.mainImageIndex] ?? p.images[0],
    name: p.title,
    type: '중고거래',
    seller: 'hwaseong',
    category: p.category,
    condition: p.condition,
    price: p.price,
    status: p.status,
    registeredAt: '2026.04.25',
  }));

  return [...myItems, ...tradeItems, ...auctionItems];
};

// ─── 사이드바 메뉴 구조 ─────────────────────────────────────────────────
type MenuKey =
  | '대시보드'
  | '상품 관리' | '상품 문의' | '경매 관리'
  | '허위입찰' | '제재 내역' | '채팅 로그'
  | '회원 목록' | '탈퇴 회원'
  | '공지사항' | '카테고리/배너' | '정산/수수료' | '지갑 요청' | '고객문의/FAQ'
  | '설정';

const IC = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" {...p}/>
);

const SIDE_ICONS: Record<MenuKey, React.ReactNode> = {
  /* LayoutDashboard */
  '대시보드':    <IC><rect x="3" y="3" width="7" height="10" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="17" width="7" height="4" rx="1.5"/></IC>,
  /* ShoppingBag */
  '상품 관리':   <IC><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></IC>,
  /* MessageSquare (상품 문의) */
  '상품 문의':   <IC><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></IC>,
  /* Gavel (경매 관리) */
  '경매 관리':   <IC><path d="M14 14l6 6"/><path d="M4 4l4 4"/><path d="M9 4h5v2l2 2v1l-7 7-1-1v-2l-2-2V9l3-5z"/><path d="M5 19l4-4"/></IC>,
  /* Flag */
  '허위입찰':    <IC><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></IC>,
  /* ShieldX */
  '제재 내역':   <IC><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/></IC>,
  /* FileText */
  '채팅 로그':   <IC><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></IC>,
  /* Users */
  '회원 목록':   <IC><circle cx="9" cy="6" r="3.5"/><path d="M1.5 21v-2a5.5 5.5 0 0115 0v2"/><circle cx="18.5" cy="6.5" r="2.5"/><path d="M22.5 21v-1.5a4 4 0 00-3-3.86"/></IC>,
  /* UserMinus */
  '탈퇴 회원':   <IC><circle cx="9" cy="7" r="3.5"/><path d="M1.5 21v-2a5.5 5.5 0 0111 0v2"/><line x1="16" y1="12" x2="22" y2="12"/></IC>,
  /* Megaphone */
  '공지사항':    <IC><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/><path d="M19.07 4.93a10 10 0 010 14.14"/></IC>,
  /* PanelLeft / Columns */
  '카테고리/배너': <IC><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="2" y1="9" x2="9" y2="9"/><line x1="2" y1="15" x2="9" y2="15"/></IC>,
  /* Receipt */
  '정산/수수료':  <IC><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="9.5" x2="16" y2="9.5"/><line x1="8" y1="13.5" x2="14" y2="13.5"/></IC>,
  /* Wallet */
  '지갑 요청':    <IC><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M16 10h5v5h-5a2.5 2.5 0 010-5z"/><path d="M3 9h18"/></IC>,
  /* MessageCircleQuestion */
  '고객문의/FAQ': <IC><path d="M12 21a9 9 0 100-18 9 9 0 000 18z"/><path d="M9.5 9.5a3 3 0 115 2.5c-.5.5-1.5 1-1.5 2"/><circle cx="12" cy="17" r=".5" fill="currentColor"/></IC>,
  /* SlidersHorizontal */
  '설정':        <IC><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="3" y2="18"/><circle cx="8" cy="6" r="2" fill="#fff"/><circle cx="16" cy="12" r="2" fill="#fff"/><circle cx="8" cy="18" r="2" fill="#fff"/></IC>,
};

const SIDE_SECTIONS: { label: string; items: { key: MenuKey; label: string }[] }[] = [
  {
    label: 'Overview',
    items: [{ key: '대시보드', label: 'Dashboard' }],
  },
  {
    label: 'Products',
    items: [
      { key: '상품 관리', label: 'Product Management' },
      { key: '상품 문의', label: 'Product Inquiries' },
    ],
  },
  {
    label: 'Auction',
    items: [
      { key: '경매 관리', label: 'Auction Management' },
    ],
  },
  {
    label: 'Reports & Sanctions',
    items: [
      { key: '허위입찰', label: 'False Bids' },
      { key: '제재 내역', label: 'Sanction History' },
      { key: '채팅 로그', label: 'Chat Logs (On Hold)' },
    ],
  },
  {
    label: 'Members',
    items: [
      { key: '회원 목록', label: 'Member List' },
      { key: '탈퇴 회원', label: 'Withdrawn Members' },
    ],
  },
  {
    label: 'Content',
    items: [
      { key: '공지사항', label: 'Notices' },
      { key: '카테고리/배너', label: 'Categories' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { key: '정산/수수료', label: 'Settlements & Fees' },
      { key: '지갑 요청', label: 'Wallet Requests' },
      { key: '고객문의/FAQ', label: 'FAQ' },
    ],
  },
  {
    label: 'System',
    items: [
      { key: '설정', label: 'Settings' },
    ],
  },
];

const CATEGORY_OPTIONS = ['전체', '디지털/가전', '패션/의류', '명품', '시계/주얼리', '신발', '스포츠/레저', '뷰티/미용', '게임/취미', '음향/악기', '한정판', '이월상품'];


// ─── AdminPage ─────────────────────────────────────────────────────────
interface Props { onLogout: () => void; onSwitchToNormal: () => void; }

const WARN_COUNTDOWN_S = 30; // 경고 후 30초 뒤 자동 로그아웃
const IDLE_STORAGE_KEY = 'bazar_admin_idle_minutes';
const IDLE_WARNED_KEY = 'bazar_admin_idle_warned';

const AdminPage: React.FC<Props> = ({ onLogout, onSwitchToNormal }) => {
  const [activeMenu, setActiveMenu] = useState<MenuKey>('대시보드');
  const inquiryStore = useInquiries();
  const pendingInquiryCount = inquiryStore.filter(i => !i.answer).length;
  const [products, setProducts] = useState<AdminProduct[]>(buildInitialProducts);

  // ─── 자동 로그아웃 ─────────────────────────────────────────────────
  const [idleMinutes, setIdleMinutes] = useState<IdleMinutes>(() => {
    const saved = localStorage.getItem(IDLE_STORAGE_KEY);
    const parsed = saved ? Number(saved) : 10;
    return (IDLE_OPTIONS.map(o => o.value) as number[]).includes(parsed)
      ? (parsed as IdleMinutes)
      : 10;
  });
  const [showIdleModal, setShowIdleModal] = useState(false);
  const [, setCountdown] = useState(WARN_COUNTDOWN_S);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const idleMinutesRef = useRef(idleMinutes);

  useEffect(() => { idleMinutesRef.current = idleMinutes; }, [idleMinutes]);

  // 새로고침 시 경고 상태였으면 즉시 로그아웃
  useEffect(() => {
    if (localStorage.getItem(IDLE_WARNED_KEY)) {
      localStorage.removeItem(IDLE_WARNED_KEY);
      onLogout();
    }
  }, [onLogout]);

  const handleChangeIdleMinutes = (v: IdleMinutes) => {
    setIdleMinutes(v);
    localStorage.setItem(IDLE_STORAGE_KEY, String(v));
  };

  // ─── 로그인 시각 ──────────────────────────────────────────────────
  const loginAt = (() => {
    const raw = localStorage.getItem('bazar_admin_login_at');
    if (!raw) return '';
    const d = new Date(raw);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  })();

  const clearCountdown = () => {
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
  };

  const startCountdown = useCallback(() => {
    setCountdown(WARN_COUNTDOWN_S);
    clearCountdown();
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearCountdown();
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onLogout]);

  const resetIdleTimer = useCallback(() => {
    if (showIdleModal) return; // 경고 모달 중엔 활동 무시
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      localStorage.setItem(IDLE_WARNED_KEY, '1');
      setShowIdleModal(true);
      startCountdown();
    }, idleMinutesRef.current * 60 * 1000);
  }, [showIdleModal, startCountdown]);

  // 활동 이벤트 감지
  useEffect(() => {
    const events: (keyof DocumentEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer(); // 초기 타이머 시작
    return () => {
      events.forEach(e => document.removeEventListener(e, resetIdleTimer));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      clearCountdown();
    };
  }, [resetIdleTimer]);

  // 상품관리 필터 상태
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('전체');
  const [statusFilter, setStatusFilter] = useState('전체');
  const [statFilter, setStatFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // 안내 알림 모달
  const [alertModal, setAlertModal] = useState<string | null>(null);

  // 삭제 확인 모달
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  // 승인/취소 확인 모달
  const [approveTarget, setApproveTarget] = useState<{ product: AdminProduct; action: 'approve' | 'cancel' } | null>(null);

  const handleApproveConfirm = () => {
    if (!approveTarget) return;
    const newStatus: ProductStatus = approveTarget.action === 'approve' ? '경매중' : '경매예정';
    handleStatusChange(approveTarget.product.id, newStatus);
    setApproveTarget(null);
  };

  // 상품 상세 모달
  const [detailProduct, setDetailProduct] = useState<AdminProduct | null>(null);
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AdminProduct>>({});

  // 입찰 이력 모달
  const [bidHistoryTarget, setBidHistoryTarget] = useState<AdminProduct | null>(null);

  const BIDDERS = ['운동화마니아', '코딩러버', '사진작가K', '기타리스트', '워치컬렉터', '뷰티러버', '패션킹', '게이머Z', '오디오파일', '홈퍼니싱'];
  const getMockBids = (product: AdminProduct) => {
    const seed = product.price;
    const count = 3 + (seed % 5);
    return Array.from({ length: count }, (_, i) => ({
      rank: i + 1,
      bidder: BIDDERS[(seed + i * 3) % BIDDERS.length],
      amount: product.price - i * Math.round(product.price * 0.03),
      time: `2026.05.${String(3 - Math.floor(i / 3)).padStart(2, '0')} ${String(14 - i).padStart(2, '0')}:${String((seed + i * 7) % 60).padStart(2, '0')}`,
    }));
  };

  // ─── 배지 카운트 (사이드바용) ──────────────────────────────────────
  const getBadge = (key: MenuKey): number | null => {
    if (key === '상품 문의') return pendingInquiryCount > 0 ? pendingInquiryCount : null;
    return null;
  };

  // ─── 검색/드롭다운 필터만 적용 (statFilter 제외) ────────────────
  const baseFiltered = useMemo(() => {
    return products.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.seller.toLowerCase().includes(search.toLowerCase()) && !p.productNo.includes(search)) return false;
      if (categoryFilter !== '전체' && p.category !== categoryFilter) return false;
      if (statusFilter !== '전체' && p.status !== statusFilter) return false;
      return true;
    });
  }, [products, search, categoryFilter, statusFilter]);

  // ─── 상품 통계 (검색 결과 기준) ──────────────────────────────────
  const stats = useMemo(() => ({
    total: baseFiltered.length,
    trade: baseFiltered.filter(p => p.type === '중고거래').length,
    auction: baseFiltered.filter(p => p.type === '경매').length,
    selling: baseFiltered.filter(p => p.status === '경매예정').length,
    approving: baseFiltered.filter(p => p.status === '승인요청중').length,
    inBid: baseFiltered.filter(p => p.status === '경매중').length,
    won: baseFiltered.filter(p => p.status === '낙찰').length,
    failed: baseFiltered.filter(p => p.status === '유찰').length,
    hidden: baseFiltered.filter(p => p.status === '숨김').length,
  }), [baseFiltered]);

  // ─── 필터링된 상품 목록 (statFilter 추가 적용) ───────────────────
  const filtered = useMemo(() => {
    return baseFiltered.filter(p => {
      if (statFilter && p.status !== statFilter) return false;
      return true;
    });
  }, [baseFiltered, statFilter]);

  const handleStatusChange = (id: string, newStatus: AdminProduct['status']) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setProducts(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleStatClick = (key: string) => {
    setStatFilter(prev => prev === key ? null : key);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // ─── 상품관리 렌더 ───────────────────────────────────────────────
  const renderProducts = () => (
    <>
      <div className={styles.pageTitle}>상품 관리</div>
      <div className={styles.pageSubtitle}>전체 상품을 조회하고 상태를 관리합니다.</div>

      <div className={styles.statsRow}>
        {[
          { key: null, label: '전체 상품', value: stats.total },
          { key: '경매예정', label: '경매예정', value: stats.selling },
          { key: '승인요청중', label: '승인요청', value: stats.approving },
          { key: '경매중', label: '경매중', value: stats.inBid },
          { key: '숨김', label: '숨김', value: stats.hidden },
        ].map(s => (
          <div
            key={s.label}
            className={`${styles.statCard} ${statFilter === s.key ? styles.statCardActive : ''}`}
            onClick={() => {
              if (s.key === null) {
                setStatFilter(null);
              } else {
                handleStatClick(s.key);
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.statLabel}>{s.label}</div>
            <div className={styles.statValue}>{s.value.toLocaleString()}<span className={styles.statUnit}>건</span></div>
          </div>
        ))}
      </div>

      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <input
            className={styles.searchInput}
            placeholder="상품명, 상품번호 또는 판매자 검색"
            value={search}
            onChange={e => { setSearch(e.target.value); setStatFilter(null); setCurrentPage(1); }}
          />
        </div>
        <select className={styles.filterSelect} value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setStatFilter(null); setCurrentPage(1); }}>
          {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className={styles.filterSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setStatFilter(null); setCurrentPage(1); }}>
          {['전체', '경매예정', '승인요청중', '경매중', '낙찰', '유찰', '숨김'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className={styles.tableWrap}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <div className={styles.emptyText}>검색 결과가 없습니다</div>
          </div>
        ) : (
          <table className={styles.table} style={{ tableLayout: 'fixed' }}>
            <colgroup>
              <col style={{ width: 100 }} />
              <col style={{ width: 240 }} />
              <col style={{ width: 120 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: 150 }} />
              <col style={{ width: 110 }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ textAlign: 'center' }}>상품번호</th><th style={{ textAlign: 'center' }}>상품</th><th>판매자</th><th>가격</th><th>등록일</th><th>관리</th><th>승인</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id}>
                  <td style={{ fontSize: 12, color: '#8B8FA8', fontFamily: 'monospace', textAlign: 'center' }}>{p.productNo}</td>
                  <td style={{ textAlign: 'left' }}>
                    <div className={styles.productCell}>
                      <img src={p.image} alt={p.name} className={styles.productThumb} />
                      <div>
                        <div className={styles.productName} style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setDetailProduct(p)}>{p.name}</div>
                        <div className={styles.productCategory}>{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td>{p.seller}</td>
                  <td>{p.price.toLocaleString()}</td>
                  <td>{p.registeredAt}</td>
                  <td>
                    <div className={styles.actionCell}>
                      <select
                        className={styles.statusSelect}
                        value={p.status}
                        onChange={e => {
                          if (e.target.value === '경매중') {
                            setAlertModal('경매중 변경은\n승인 버튼을 통해서만 가능합니다.');
                            return;
                          }
                          handleStatusChange(p.id, e.target.value as ProductStatus);
                        }}
                      >
                        <>
                          <option value="경매예정">경매예정</option>
                          <option value="승인요청중">승인요청중</option>
                          <option value="경매중">경매중</option>
                          <option value="숨김">숨김</option>
                        </>
                      </select>
                    </div>
                  </td>
                  <td>
                    {p.status === '승인요청중' && (
                      <button
                        className={styles.approveBtn}
                        onClick={() => setApproveTarget({ product: p, action: 'approve' })}
                      >
                        승인
                      </button>
                    )}
                    {p.status === '경매중' && (
                      <button
                        className={styles.cancelBtn}
                        onClick={() => setApproveTarget({ product: p, action: 'cancel' })}
                      >
                        취소
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 20 }}>
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: currentPage === 1 ? '#F5F5F5' : '#fff', color: currentPage === 1 ? '#ccc' : '#333', cursor: currentPage === 1 ? 'default' : 'pointer', fontSize: 13 }}
          >이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: currentPage === page ? '#E24B4A' : '#fff', color: currentPage === page ? '#fff' : '#333', cursor: 'pointer', fontWeight: currentPage === page ? 700 : 400, fontSize: 13 }}
            >{page}</button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: currentPage === totalPages ? '#F5F5F5' : '#fff', color: currentPage === totalPages ? '#ccc' : '#333', cursor: currentPage === totalPages ? 'default' : 'pointer', fontSize: 13 }}
          >다음</button>
        </div>
      )}
    </>
  );

  // ─── 메뉴별 컨텐츠 렌더 ─────────────────────────────────────────
  const renderContent = () => {
    switch (activeMenu) {
      case '대시보드': return <DashboardPage totalProducts={products.length} />;
      case '상품 관리': return renderProducts();
      case '상품 문의': return <InquiryProductPage />;
      case '경매 관리': return <AuctionManagePage />;
      case '허위입찰': return <FalseBidPage />;
      case '제재 내역': return <SanctionPage />;
      case '채팅 로그': return <ChatLogPage />;
      case '회원 목록': return <MemberListPage />;
      case '탈퇴 회원': return <WithdrawnMemberPage />;
      case '공지사항': return <NoticePage />;
      case '카테고리/배너': return <BannerPage />;
      case '정산/수수료': return <SettlementPage />;
      case '지갑 요청': return <WalletRequestPage />;
      case '고객문의/FAQ': return <InquiryPage />;
      case '설정': return (
        <AdminSettingsPage
          idleMinutes={idleMinutes}
          onChangeIdleMinutes={handleChangeIdleMinutes}
        />
      );
      default: return null;
    }
  };

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
      {/* 상단 헤더 */}
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className={styles.headerLogo}>MO<span>IDA</span></span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.headerAdmin}><strong>관리자</strong>로 로그인 중</span>
          <button className={styles.normalBtn} onClick={onSwitchToNormal} title="일반 화면" aria-label="일반 화면으로 이동">
            <svg className={styles.normalIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3 11.5 12 4l9 7.5" />
              <path d="M5.5 10.5V20h13v-9.5" />
              <path d="M9.5 20v-5.5h5V20" />
            </svg>
          </button>
          <button className={styles.logoutBtn} onClick={onLogout}>로그아웃</button>
        </div>
      </header>

      <div className={styles.body}>
        {/* 사이드바 */}
        <nav className={styles.sidebar}>
          <div className={styles.sidebarMenu}>
            {SIDE_SECTIONS.map(section => (
              <div key={section.label}>
                <div className={styles.sideSection}>{section.label}</div>
                {section.items.map(m => {
                  const badge = getBadge(m.key);
                  return (
                    <button
                      key={m.key}
                      className={`${styles.sideItem} ${activeMenu === m.key ? styles.sideItemActive : ''}`}
                      onClick={() => setActiveMenu(m.key)}
                    >
                      <span className={styles.sideIcon}>{SIDE_ICONS[m.key]}</span>
                      {m.label}
                      {badge !== null && badge > 0 && (
                        <span className={styles.sideBadge}>{badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
          <div className={styles.sidebarFooter}>
            <div className={styles.adminStatus}>
              <span className={styles.adminStatusLabel}>접속</span>
              <span className={styles.headerClock}>{loginAt || '-'}</span>
            </div>
          </div>
        </nav>

        {/* 메인 컨텐츠 */}
        <main className={styles.main}>
          {renderContent()}
        </main>
      </div>

      {/* 상품 상세 모달 */}
      {detailProduct && (
        <div className={styles.detailOverlay} onClick={() => { setDetailProduct(null); setIsEditingDetail(false); }}>
          <div className={styles.detailSheet} onClick={e => e.stopPropagation()}>
            {/* 헤더 */}
            <div className={styles.detailHeader}>
              <span className={styles.detailHeaderTitle}>{isEditingDetail ? '상품 수정' : '상품 상세'}</span>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {isEditingDetail ? (
                  <>
                    <button className={styles.detailEditSaveBtn} onClick={() => {
                      setProducts(prev => prev.map(p => p.id === detailProduct.id ? { ...p, ...editForm } : p));
                      setDetailProduct(prev => prev ? { ...prev, ...editForm } : null);
                      setIsEditingDetail(false);
                    }}>저장</button>
                    <button className={styles.detailEditCancelBtn} onClick={() => setIsEditingDetail(false)}>취소</button>
                  </>
                ) : (
                  <button className={styles.detailEditBtn} onClick={() => { setEditForm({ name: detailProduct.name, price: detailProduct.price, category: detailProduct.category, condition: detailProduct.condition, status: detailProduct.status }); setIsEditingDetail(true); }}>
                    수정
                  </button>
                )}
                <button className={styles.detailCloseBtn} onClick={() => { setDetailProduct(null); setIsEditingDetail(false); }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className={styles.detailScroll}>
              {/* 이미지 */}
              <img src={detailProduct.image} alt={detailProduct.name} className={styles.detailImg} />

              {/* 판매자 */}
              <div className={styles.detailSection}>
                <div className={styles.detailSellerRow}>
                  <div className={styles.detailSellerAvatar}>😊</div>
                  <div className={styles.detailSellerInfo}>
                    <p className={styles.detailSellerName}>{detailProduct.seller}</p>
                    <div className={styles.detailSellerMeta}>
                      <span className={styles.detailSellerSub}>📦 {detailProduct.type}</span>
                      <span className={styles.detailSellerSub}>🗓 {detailProduct.registeredAt}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.detailDivider}/>

              {/* 상품 정보 */}
              <div className={styles.detailSection}>
                <div className={styles.detailTagRow}>
                  <span className={styles.detailCategoryTag}>{editForm.category ?? detailProduct.category}</span>
                  <span className={styles.detailTypeTag}>{detailProduct.type}</span>
                </div>
                {isEditingDetail ? (
                  <input
                    className={styles.detailEditInput}
                    value={editForm.name ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="상품명"
                  />
                ) : (
                  <h2 className={styles.detailName}>{detailProduct.name}</h2>
                )}
                <p className={styles.detailMeta}>등록일 {detailProduct.registeredAt}</p>
                {isEditingDetail ? (
                  <input
                    className={styles.detailEditInput}
                    type="number"
                    value={editForm.price ?? ''}
                    onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))}
                    placeholder="가격"
                  />
                ) : (
                  <p className={styles.detailPrice}> {detailProduct.price.toLocaleString()}</p>
                )}
              </div>

              <div className={styles.detailDivider}/>

              {/* 거래 정보 */}
              <div className={styles.detailSection}>
                <p className={styles.detailSectionTitle}>거래 정보</p>
                <div className={styles.detailInfoGrid}>
                  <div className={styles.detailInfoItem}>
                    <span className={styles.detailInfoLabel}>유형</span>
                    <span className={styles.detailInfoValue}>{detailProduct.type === '중고거래' ? '경매예정' : detailProduct.type}</span>
                  </div>
                  <div className={styles.detailInfoItem}>
                    <span className={styles.detailInfoLabel}>카테고리</span>
                    {isEditingDetail ? (
                      <select className={styles.detailEditSelect} value={editForm.category ?? ''} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}>
                        {CATEGORY_OPTIONS.filter(c => c !== '전체').map(c => <option key={c}>{c}</option>)}
                      </select>
                    ) : (
                      <span className={styles.detailInfoValue}>{detailProduct.category}</span>
                    )}
                  </div>
                  <div className={styles.detailInfoItem}>
                    <span className={styles.detailInfoLabel}>판매자</span>
                    <span className={styles.detailInfoValue}>{detailProduct.seller}</span>
                  </div>
                  <div className={styles.detailInfoItem}>
                    <span className={styles.detailInfoLabel}>가격</span>
                    {isEditingDetail ? (
                      <input className={styles.detailEditSelect} type="number" value={editForm.price ?? ''} onChange={e => setEditForm(f => ({ ...f, price: Number(e.target.value) }))} />
                    ) : (
                      <span className={styles.detailInfoValue}> {detailProduct.price.toLocaleString()}</span>
                    )}
                  </div>
                  <div className={styles.detailInfoItem}>
                    <span className={styles.detailInfoLabel}>제품상태</span>
                    {isEditingDetail ? (
                      <select className={styles.detailEditSelect} value={editForm.condition ?? ''} onChange={e => setEditForm(f => ({ ...f, condition: e.target.value }))}>
                        {['미개봉', '거의새것', '상태양호', '사용감있음', '많이사용함'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    ) : (
                      <span className={styles.detailInfoValue}>{detailProduct.condition}</span>
                    )}
                  </div>
                  <div className={styles.detailInfoItem}>
                    <span className={styles.detailInfoLabel}>상태</span>
                    {isEditingDetail ? (
                      <select className={styles.detailEditSelect} value={editForm.status ?? ''} onChange={e => setEditForm(f => ({ ...f, status: e.target.value as ProductStatus }))}>
                        {['경매예정', '승인요청중', '경매중', '숨김'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <span className={styles.detailInfoValue}>{detailProduct.status}</span>
                    )}
                  </div>
                  <div className={styles.detailInfoItem}>
                    <span className={styles.detailInfoLabel}>등록일</span>
                    <span className={styles.detailInfoValue}>{detailProduct.registeredAt}</span>
                  </div>
                </div>
              </div>

              <div style={{ height: 32 }}/>
            </div>
          </div>
        </div>
      )}

      {/* 입찰 이력 모달 */}
      {bidHistoryTarget && (
        <div className={styles.detailOverlay} onClick={() => setBidHistoryTarget(null)}>
          <div className={styles.detailSheet} onClick={e => e.stopPropagation()}>
            <div className={styles.detailHeader}>
              <span className={styles.detailHeaderTitle}>입찰 이력</span>
              <button className={styles.detailCloseBtn} onClick={() => setBidHistoryTarget(null)}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className={styles.detailScroll}>
              <div className={styles.detailSection}>
                <p className={styles.detailName} style={{ fontSize: 15 }}>{bidHistoryTarget.name}</p>
                <p className={styles.detailMeta}>경매 시작가 {bidHistoryTarget.price.toLocaleString()}</p>
              </div>
              <div className={styles.detailDivider}/>
              <div className={styles.detailSection}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #E8E8E8' }}>
                      <th style={{ padding: '8px 6px', textAlign: 'center', color: '#8B8FA8', fontWeight: 600, width: 40 }}>순위</th>
                      <th style={{ padding: '8px 6px', textAlign: 'left', color: '#8B8FA8', fontWeight: 600 }}>입찰자</th>
                      <th style={{ padding: '8px 6px', textAlign: 'right', color: '#8B8FA8', fontWeight: 600 }}>입찰가</th>
                      <th style={{ padding: '8px 6px', textAlign: 'right', color: '#8B8FA8', fontWeight: 600 }}>입찰 시각</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getMockBids(bidHistoryTarget).map(bid => (
                      <tr key={bid.rank} style={{ borderBottom: '1px solid #F3F3F3' }}>
                        <td style={{ padding: '10px 6px', textAlign: 'center', fontWeight: 700, color: bid.rank === 1 ? '#E24B4A' : '#8B8FA8' }}>
                          {bid.rank === 1 ? '🥇' : bid.rank}
                        </td>
                        <td style={{ padding: '10px 6px', fontWeight: bid.rank === 1 ? 600 : 400 }}>{bid.bidder}</td>
                        <td style={{ padding: '10px 6px', textAlign: 'right', fontWeight: 700, color: bid.rank === 1 ? '#E24B4A' : '#333' }}>
                          {bid.amount.toLocaleString()}
                        </td>
                        <td style={{ padding: '10px 6px', textAlign: 'right', color: '#8B8FA8' }}>{bid.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ height: 24 }}/>
            </div>
          </div>
        </div>
      )}

      {/* 안내 알림 모달 */}
      {alertModal && (
        <div className={styles.modalOverlay} onClick={() => setAlertModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>⚠️</div>
            <div className={styles.modalTitle}>변경 불가</div>
            <div className={styles.modalDesc}>
              {alertModal.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
            </div>
            <div className={styles.modalBtns}>
              <button className={styles.modalApproveBtn} onClick={() => setAlertModal(null)}>확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 자동 로그아웃 경고 모달 */}
      {showIdleModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="13" r="8"/>
                <path d="M12 9v4l2.5 2.5"/>
                <path d="M9 2h6"/>
                <path d="M12 2v3"/>
              </svg>
            </div>
            <div className={styles.modalTitle}>자동 로그아웃 예정</div>
            <div className={styles.modalDesc}>
              {idleMinutes}분간 입력이 없었습니다.<br />
              자동으로 로그아웃됩니다.
            </div>
            <div className={styles.modalBtns}>
              <button className={styles.modalDeleteBtn} onClick={onLogout}>로그아웃</button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 */}
      {/* 승인/취소 확인 모달 */}
      {approveTarget && (
        <div className={styles.modalOverlay} onClick={() => setApproveTarget(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalIcon}>{approveTarget.action === 'approve' ? '✅' : '⛔'}</div>
            <div className={styles.modalTitle}>
              {approveTarget.action === 'approve' ? '경매를 승인하시겠어요?' : '경매를 취소하시겠어요?'}
            </div>
            <div className={styles.modalDesc}>
              '{approveTarget.product.name}'<br />
              {approveTarget.action === 'approve'
                ? '승인 시 상태가 경매중으로 변경됩니다.'
                : '취소 시 상태가 경매예정으로 되돌아갑니다.'}
            </div>
            <div className={styles.modalBtns}>
              <button className={styles.modalCancelBtn} onClick={() => setApproveTarget(null)}>닫기</button>
              <button
                className={approveTarget.action === 'approve' ? styles.modalApproveBtn : styles.modalDeleteBtn}
                onClick={handleApproveConfirm}
              >
                {approveTarget.action === 'approve' ? '승인하기' : '취소하기'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalIcon}>🗑️</div>
            <div className={styles.modalTitle}>상품을 삭제하시겠어요?</div>
            <div className={styles.modalDesc}>
              '{deleteTarget.name}'<br />
              삭제된 상품은 복구할 수 없습니다.
            </div>
            <div className={styles.modalBtns}>
              <button className={styles.modalCancelBtn} onClick={() => setDeleteTarget(null)}>취소</button>
              <button className={styles.modalDeleteBtn} onClick={handleDelete}>삭제하기</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminPage;
