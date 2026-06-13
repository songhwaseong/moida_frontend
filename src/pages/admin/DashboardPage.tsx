import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminMembers, type AdminMemberDto } from '../../api/adminMembers';
import { getAdminProducts, type AdminProductDto } from '../../api/adminProducts';
import { getAdminAuctions, type AdminAuctionDto } from '../../api/adminAuctions';
import { getAdminSanctions, sanctionEnumToLabel, type AdminSanctionDto, type SanctionTypeLabel } from '../../api/adminSanctions';
import styles from './DashboardPage.module.css';
import { useRegisterAdminRefresh } from './AdminRefreshContext';

/** 대시보드 카드 클릭 시 이동할 대상 영역 식별자. */
export type DashboardNavTarget =
  | 'members'        // 회원 목록
  | 'products'       // 상품 관리
  | 'auctionWon'     // 경매 관리(낙찰 필터)
  | 'auctionFailed'  // 경매 관리(유찰 필터)
  | 'sanctions';     // 제재 내역

interface Props {
  totalProducts: number;
  /** 카드 클릭 시 상위(AdminPage)에 이동을 요청하는 콜백. 없으면 카드는 비활성(클릭 불가). */
  onNavigate?: (target: DashboardNavTarget) => void;
}

const CardIcon = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <svg width="24" height="24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{children}</svg>
);

const DashboardPage: React.FC<Props> = ({ totalProducts, onNavigate }) => {
  // 회원/상품/경매/제재 4개 API 를 Promise.all 로 병렬 로드한다.
  const [members, setMembers] = useState<AdminMemberDto[]>([]);
  const [products, setProducts] = useState<AdminProductDto[]>([]);
  const [auctions, setAuctions] = useState<AdminAuctionDto[]>([]);
  const [sanctions, setSanctions] = useState<AdminSanctionDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [m, p, a, s] = await Promise.all([
        getAdminMembers().catch(() => [] as AdminMemberDto[]),
        getAdminProducts().catch(() => [] as AdminProductDto[]),
        getAdminAuctions().catch(() => [] as AdminAuctionDto[]),
        getAdminSanctions().catch(() => [] as AdminSanctionDto[]),
      ]);
      setMembers(m);
      setProducts(p);
      setAuctions(a);
      setSanctions(s);
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회 페치, 정상 데이터 로딩 패턴
  useEffect(() => { void loadAll(); }, [loadAll]);

  // 공통 헤더 새로고침 버튼에 대시보드 전체 로더를 연결한다.
  useRegisterAdminRefresh(loadAll, loading);

  const stats = useMemo(() => {
    const activeMembers    = members.filter(m => m.status === 'active').length;
    const suspendedMembers = members.filter(m => m.status === 'suspended' || m.status === 'permanent').length;
    const withdrawnMembers = members.filter(m => m.status === 'withdrawn').length;

    const tradeProducts   = products.filter(p => p.type === '중고거래').length;
    const auctionProducts = products.filter(p => p.type === '경매').length;

    // 낙찰/유찰 — 경매 status 기준
    const wonCount    = auctions.filter(a => a.status === 'SUCCESS').length;
    const failedCount = auctions.filter(a => a.status === 'FAILED').length;

    // 최근 등록 상품: 관리자 목록 API 가 최신순으로 내려주므로 첫 항목이 가장 최근.
    // "최근 N건" 은 등록일이 오늘인 항목 수로 보수적으로 계산.
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '.'); // yyyy.MM.dd
    const recentProductCount = products.filter(p => p.registeredAt === today).length;
    const recentProductName  = products[0]?.name ?? '-';

    const totalSanctions = sanctions.length;

    return {
      totalMembers: members.length,
      activeMembers,
      suspendedMembers,
      withdrawnMembers,
      totalSanctions,
      wonCount,
      failedCount,
      totalProducts,
      tradeProducts,
      auctionProducts,
      recentProductCount,
      recentProductName,
    };
  }, [members, products, auctions, sanctions, totalProducts]);

  // 최근 낙찰/유찰 패널 (각 5개)
  const wonItems    = useMemo(() => auctions.filter(a => a.status === 'SUCCESS').slice(0, 5), [auctions]);
  const failedItems = useMemo(() => auctions.filter(a => a.status === 'FAILED').slice(0, 5), [auctions]);

  // 최근 제재 내역 — 백엔드 응답이 이미 최신순이므로 앞에서 3개만 사용.
  const recentSanctions = useMemo(() => sanctions.slice(0, 3), [sanctions]);

  const sanctionTypeLabel = (type: SanctionTypeLabel) => ({
    warning: '경고', suspend_7: '7일 정지', suspend_30: '30일 정지', permanent: '영구 정지',
  }[type]);

  // 요약 카드를 클릭 가능하게 만드는 공용 props. onNavigate 가 없으면 클릭/포커스 비활성.
  const cardNavProps = (target: DashboardNavTarget) => (
    onNavigate
      ? {
          role: 'button',
          tabIndex: 0,
          style: { cursor: 'pointer' },
          onClick: () => onNavigate(target),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigate(target); }
          },
        }
      : {}
  );

  return (
    <div className={styles.root}>
      <div className={styles.pageTitle}>대시보드</div>
      <div className={styles.pageSubtitle}>플랫폼 현황을 한눈에 확인합니다.</div>

      {/* ─── 요약 카드 ─── */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.cardBlue}`} {...cardNavProps('members')}>
          <div className={styles.cardIcon}>
            <CardIcon color="#3B82F6">
              <circle cx="9" cy="6" r="3.5"/><path d="M1.5 21v-2a5.5 5.5 0 0115 0v2"/><circle cx="18.5" cy="6.5" r="2.5"/><path d="M22.5 21v-1.5a4 4 0 00-3-3.86"/>
            </CardIcon>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>전체 회원</div>
            <div className={styles.cardValue}>{stats.totalMembers.toLocaleString()}<span className={styles.cardUnit}>명</span></div>
            <div className={styles.cardSub}>활성 {stats.activeMembers} · 정지 {stats.suspendedMembers} · 탈퇴 {stats.withdrawnMembers}</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardGreen}`} {...cardNavProps('products')}>
          <div className={styles.cardIcon}>
            <CardIcon color="#22C55E">
              <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
            </CardIcon>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>전체 상품</div>
            <div className={styles.cardValue}>{stats.totalProducts.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>중고거래 {stats.tradeProducts} · 경매 {stats.auctionProducts}</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardGreen}`} {...cardNavProps('auctionWon')}>
          <div className={styles.cardIcon}>
            <CardIcon color="#22C55E">
              <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/><path d="M8 8h.01M12 6v4M16 8h.01"/>
            </CardIcon>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>낙찰</div>
            <div className={styles.cardValue}>{stats.wonCount.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>경매 종료 후 낙찰 완료</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardTeal}`} {...cardNavProps('products')}>
          <div className={styles.cardIcon}>
            <CardIcon color="#14B8A6">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
            </CardIcon>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>최근 등록 상품</div>
            <div className={styles.cardValue}>{stats.recentProductCount.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stats.recentProductName}</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardOrange}`} {...cardNavProps('auctionFailed')}>
          <div className={styles.cardIcon}>
            <CardIcon color="#F97316">
              <circle cx="12" cy="12" r="9"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/>
            </CardIcon>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>유찰</div>
            <div className={styles.cardValue}>{stats.failedCount.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>경매 종료 후 유찰 처리</div>
          </div>
        </div>

        <div className={`${styles.summaryCard} ${styles.cardPurple}`} {...cardNavProps('sanctions')}>
          <div className={styles.cardIcon}>
            <CardIcon color="#A855F7">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </CardIcon>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.cardLabel}>누적 제재</div>
            <div className={styles.cardValue}>{stats.totalSanctions.toLocaleString()}<span className={styles.cardUnit}>건</span></div>
            <div className={styles.cardSub}>정지·경고·영구정지 합산</div>
          </div>
        </div>

      </div>

      {/* ─── 하단 3열 ─── */}
      <div className={styles.bottomGrid}>

        {/* 최근 낙찰 현황 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>최근 낙찰 현황</span>
            <span className={styles.panelBadgeGreen}>{wonItems.length}건</span>
          </div>
          <div className={styles.panelBody}>
            {wonItems.length === 0 ? (
              <div className={styles.emptyMsg}>낙찰 내역이 없습니다.</div>
            ) : wonItems.map(a => (
              <div key={a.id} className={styles.auctionRow}>
                {/* 관리자 경매 응답에 thumbnail 이 없어 카테고리 이니셜로 대체 표시 */}
                <div className={styles.auctionThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F8', color: '#8B8FA8', fontSize: 11, fontWeight: 700 }}>
                  {a.category?.slice(0, 2) ?? '경매'}
                </div>
                <div className={styles.auctionInfo}>
                  <div className={styles.auctionName}>{a.productName}</div>
                  <div className={styles.auctionMeta}>{a.category} · 입찰 {a.bidCount}회</div>
                </div>
                <div className={styles.auctionPrice}>{a.currentPrice.toLocaleString()}원</div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 유찰 현황 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>최근 유찰 현황</span>
            <span className={styles.panelBadgeGray}>{failedItems.length}건</span>
          </div>
          <div className={styles.panelBody}>
            {failedItems.length === 0 ? (
              <div className={styles.emptyMsg}>유찰 내역이 없습니다.</div>
            ) : failedItems.map(a => (
              <div key={a.id} className={styles.auctionRow}>
                <div className={styles.auctionThumb} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F5F8', color: '#8B8FA8', fontSize: 11, fontWeight: 700 }}>
                  {a.category?.slice(0, 2) ?? '경매'}
                </div>
                <div className={styles.auctionInfo}>
                  <div className={styles.auctionName}>{a.productName}</div>
                  <div className={styles.auctionMeta}>{a.category} · 입찰 {a.bidCount}회</div>
                </div>
                <div className={styles.auctionPriceFailed}>{a.currentPrice.toLocaleString()}원</div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 제재 — 백엔드 API 없음, mock 유지 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>최근 제재 내역</span>
          </div>
          <div className={styles.panelBody}>
            {recentSanctions.length === 0 ? (
              <div className={styles.emptyMsg}>제재 내역이 없습니다.</div>
            ) : recentSanctions.map(s => (
              <div key={s.id} className={styles.sanctionRow}>
                <div className={styles.sanctionIcon}>
                  <svg width="16" height="16" fill="none" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div className={styles.sanctionBody}>
                  <div className={styles.sanctionName}>
                    {s.memberName}
                    <span className={styles.sanctionType}>{sanctionTypeLabel(sanctionEnumToLabel(s.type))}</span>
                  </div>
                  <div className={styles.sanctionReason}>{s.reason}</div>
                  <div className={styles.sanctionDate}>{s.createdAt}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardPage;
