import React, { useState, useEffect } from 'react';
import { PRODUCTS, PRODUCT_DETAILS } from '../data/mockData';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import styles from './SellerProfilePage.module.css';

interface SellerInfo {
  name: string;
  temp: number;
  sales: number;
  location: string;
}

interface Props {
  seller: SellerInfo;
  onBack: () => void;
  onProductClick?: (product: Product) => void;
}

const REVIEWS = [
  { id: 1, user: '구매자1', stars: 5, text: '친절하고 물건 상태도 완벽했어요! 강추합니다 😊', date: '2026.04.20' },
  { id: 2, user: '구매자2', stars: 4, text: '빠른 거래 감사합니다. 상품도 설명과 동일했어요.', date: '2026.04.15' },
  { id: 3, user: '구매자3', stars: 5, text: '매너 좋은 판매자세요! 다음에도 거래하고 싶어요.', date: '2026.04.10' },
];

const SellerProfilePage: React.FC<Props> = ({ seller, onBack, onProductClick }) => {
  const [activeTab, setActiveTab] = useState<'selling' | 'reviews'>('selling');
  const [barWidth, setBarWidth] = useState(0);

  // 매너온도 막대 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => {
      // 매너온도 범위: 30°C(최저) ~ 50°C(최고), 36.5°C가 중간 기준
      setBarWidth(Math.min(100, Math.max(0, ((seller.temp - 30) / 20) * 100)));
    }, 300);
    return () => clearTimeout(timer);
  }, [seller.temp]);

  const tempColor = seller.temp >= 38 ? '#E24B4A' : seller.temp >= 36.5 ? '#EF9F27' : '#5B9BD5';

  // 해당 판매자 상품 필터링
  const sellerProducts = PRODUCTS.filter((p) =>
    PRODUCT_DETAILS.find((d) => d.id === p.id && d.seller === seller.name)
  );
  const displayProducts = sellerProducts.length > 0 ? sellerProducts : PRODUCTS.slice(0, 2);

  const avgStars = (REVIEWS.reduce((sum, r) => sum + r.stars, 0) / REVIEWS.length).toFixed(1);
  const ThumbUp = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
    </svg>
  );

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.title}>판매자 프로필</span>
        <div style={{ width: 32 }}/>
      </div>

      <div className={styles.scroll}>
        {/* 프로필 카드 */}
        <div className={styles.profileCard}>
          <div className={styles.avatar}>😊</div>
          <div className={styles.profileInfo}>
            <p className={styles.name}>{seller.name}</p>
            <p className={styles.location}>📍 {seller.location}</p>

            {/* 매너온도 */}
            <div className={styles.tempRow}>
              <span className={styles.tempLabel}>매너온도</span>
              <span className={styles.tempValue} style={{ color: tempColor }}>
                {seller.temp}°C
              </span>
            </div>
            <div className={styles.tempBarWrap}>
              <div className={styles.tempBar}>
                <div
                  className={styles.tempFill}
                  style={{ width: `${barWidth}%`, background: tempColor, transition: 'width 0.8s ease' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 통계 */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{seller.sales}</span>
            <span className={styles.statLabel}>거래 횟수</span>
          </div>
          <div className={styles.statDivider}/>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{avgStars}</span>
            <span className={styles.statLabel}>평균 평점</span>
          </div>
          <div className={styles.statDivider}/>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{displayProducts.length}</span>
            <span className={styles.statLabel}>판매중</span>
          </div>
          <div className={styles.statDivider}/>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{REVIEWS.length}</span>
            <span className={styles.statLabel}>후기</span>
          </div>
        </div>

        {/* 탭 */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'selling' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('selling')}
          >판매 상품 {displayProducts.length}</button>
          <button
            className={`${styles.tab} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('reviews')}
          >받은 후기 {REVIEWS.length}</button>
        </div>

        {/* 판매 상품 */}
        {activeTab === 'selling' && (
          <div className={styles.productList}>
            {displayProducts.length > 0 ? (
              displayProducts.map((p) => (
                <div key={p.id} onClick={() => onProductClick?.(p)}>
                  <ProductCard product={p} />
                </div>
              ))
            ) : (
              <div className={styles.empty}>
                <p style={{ fontSize: 36 }}>📦</p>
                <p className={styles.emptyText}>판매중인 상품이 없어요</p>
              </div>
            )}
          </div>
        )}

        {/* 받은 후기 */}
        {activeTab === 'reviews' && (
          <div className={styles.reviewList}>
            {REVIEWS.map((r) => (
              <div key={r.id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewUser}>
                    <div className={styles.reviewAvatar}>👤</div>
                    <span className={styles.reviewName}>{r.user}</span>
                  </div>
                  <span className={styles.reviewDate}>{r.date}</span>
                </div>
                <div className={styles.stars} style={{ display: 'flex', gap: 3, color: '#E24B4A' }}>
                  {Array.from({ length: r.stars }).map((_, i) => <ThumbUp key={i} />)}
                </div>
                <p className={styles.reviewText}>{r.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default SellerProfilePage;
