import React, { useMemo } from 'react';
import { SANCTIONS } from '../../data/adminData';
import { MEMBERS } from '../../data/memberData';
import { PRODUCTS, AUCTION_ITEMS } from '../../data/mockData';
import styles from './DashboardPage.module.css';

interface Props {
  totalProducts: number;
}

const CardIcon = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <svg width="24" height="24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{children}</svg>
);

const DashboardPage: React.FC<Props> = ({ totalProducts }) => {
  const stats = useMemo(() => {
    const activeMembers   = MEMBERS.filter(m => m.status === 'active').length;
    const suspendedMembers = MEMBERS.filter(m => m.status === 'suspended' || m.status === 'permanent').length;
    const withdrawnMembers = MEMBERS.filter(m => m.status === 'withdrawn').length;
    const totalSanctions  = SANCTIONS.length;
    const wonCount    = AUCTION_ITEMS.filter(a => !a.isLive && a.id % 3 !== 0).length;
    const failedCount = AUCTION_ITEMS.filter(a => !a.isLive && a.id % 3 === 0).length;

    const recentProducts = PRODUCTS.filter(p => p.timeAgo.includes('분 전') || p.timeAgo.includes('시간 전'));

    return {
      totalMembers: MEMBERS.length,
      activeMembers,
      suspendedMembers,
      withdrawnMembers,
      totalSanctions,
      wonCount,
      failedCount,
      totalProducts,
      tradeProducts: PRODUCTS.length,
      auctionProducts: AUCTION_ITEMS.length,
      recentProductCount: recentProducts.length,
      recentProductName: recentProducts[0]?.name ?? '-',
    };
  }, [totalProducts]);

  const wonItems    = AUCTION_ITEMS.filter(a => !a.isLive && a.id % 3 !== 0).slice(0, 5);
  const failedItems = AUCTION_ITEMS.filter(a => !a.isLive && a.id % 3 === 0).slice(0, 5);

  const recentSanctions = SANCTIONS.slice().sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  ).slice(0, 3);

  const sanctionTypeLabel = (type: string) => {
    if (type === 'warning')    return '경고';
    if (type === 'suspend_7')  return '7일 정지';
    if (type === 'suspend_30') return '30일 정지';
    return '영구 정지';
  };

  return (
    <div className={styles.root}>
      <div className={styles.pageTitle}>대시보드</div>
      <div className={styles.pageSubtitle}>플랫폼 현황을 한눈에 확인합니다.</div>

      {/* ─── 요약 카드 ─── */}
      <div className={styles.summaryGrid}>
        <div className={`${styles.summaryCard} ${styles.cardBlue}`}>
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

        <div className={`${styles.summaryCard} ${styles.cardGreen}`}>
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

        <div className={`${styles.summaryCard} ${styles.cardGreen}`}>
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

        <div className={`${styles.summaryCard} ${styles.cardTeal}`}>
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

        <div className={`${styles.summaryCard} ${styles.cardOrange}`}>
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

        <div className={`${styles.summaryCard} ${styles.cardPurple}`}>
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
                <img src={a.image} alt={a.name} className={styles.auctionThumb} />
                <div className={styles.auctionInfo}>
                  <div className={styles.auctionName}>{a.name}</div>
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
                <img src={a.image} alt={a.name} className={styles.auctionThumb} />
                <div className={styles.auctionInfo}>
                  <div className={styles.auctionName}>{a.name}</div>
                  <div className={styles.auctionMeta}>{a.category} · 입찰 {a.bidCount}회</div>
                </div>
                <div className={styles.auctionPriceFailed}>{a.currentPrice.toLocaleString()}원</div>
              </div>
            ))}
          </div>
        </div>

        {/* 최근 제재 */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>최근 제재 내역</span>
          </div>
          <div className={styles.panelBody}>
            {recentSanctions.map(s => (
              <div key={s.id} className={styles.sanctionRow}>
                <div className={styles.sanctionIcon}>
                  <svg width="16" height="16" fill="none" stroke="#A855F7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                </div>
                <div className={styles.sanctionBody}>
                  <div className={styles.sanctionName}>
                    {s.memberName}
                    <span className={styles.sanctionType}>{sanctionTypeLabel(s.type)}</span>
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
