import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS, AUCTION_ITEMS } from '../data/mockData';
import type { AuctionItem, Product } from '../types';
import styles from './PopularPage.module.css';

const PERIODS = ['오늘', '이번주', '이번달'] as const;
type Period = typeof PERIODS[number];

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
};

interface Props {
  selectedCategory?: string | null;
  onProductClick?: (product: Product) => void;
  onAuctionClick?: (item: AuctionItem) => void;
}

// 기간별 정렬 및 라벨 설정
const PERIOD_CONFIG: Record<Period, {
  productSort: (a: Product, b: Product) => number;
  auctionSort: (a: AuctionItem, b: AuctionItem) => number;
  productLabel: string;
  auctionLabel: string;
  badge: string;
}> = {
  '오늘': {
    productSort: (a, b) => b.likeCount - a.likeCount,
    auctionSort: (a, b) => b.bidCount - a.bidCount,
    productLabel: '오늘 관심 많은 중고',
    auctionLabel: '오늘 입찰 많은 경매',
    badge: '🔥 HOT',
  },
  '이번주': {
    productSort: (a, b) => a.price - b.price,
    auctionSort: (a, b) => a.timeLeft - b.timeLeft,
    productLabel: '이번주 가성비 중고',
    auctionLabel: '이번주 마감 임박 경매',
    badge: '📈 WEEKLY',
  },
  '이번달': {
    productSort: (a, b) => b.price - a.price,
    auctionSort: (a, b) => b.currentPrice - a.currentPrice,
    productLabel: '이번달 프리미엄 중고',
    auctionLabel: '이번달 고가 경매',
    badge: '👑 TOP',
  },
};

const PopularPage: React.FC<Props> = ({ selectedCategory, onProductClick, onAuctionClick }) => {
  const [period, setPeriod] = useState<Period>('오늘');
  const [activeTab, setActiveTab] = useState<'product' | 'auction'>('product');

  const config = PERIOD_CONFIG[period];

  const baseProducts = selectedCategory
    ? PRODUCTS.filter((p) => p.category === selectedCategory)
    : PRODUCTS;

  const baseAuctions = selectedCategory
    ? AUCTION_ITEMS.filter((a) => a.category === selectedCategory)
    : AUCTION_ITEMS;

  const sortedProducts = [...baseProducts].sort(config.productSort);
  const sortedAuctions = [...baseAuctions].sort(config.auctionSort);

  return (
    <main className={styles.main}>
      {/* 기간 선택 */}
      <div className={styles.periodRow}>
        {PERIODS.map((p) => (
          <button
            key={p}
            className={`${styles.periodBtn} ${period === p ? styles.active : ''}`}
            onClick={() => setPeriod(p)}
          >{p}</button>
        ))}
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'product' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('product')}
        >
          인기 중고
          {selectedCategory && <span className={styles.categoryBadge}>{selectedCategory}</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'auction' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('auction')}
        >
          인기 경매
          {selectedCategory && <span className={styles.categoryBadge}>{selectedCategory}</span>}
        </button>
      </div>

      {/* 인기 중고 */}
      {activeTab === 'product' && (
        sortedProducts.length > 0 ? (
          <div className={styles.rankList}>
            {sortedProducts.map((p, i) => (
              <div key={p.id} className={styles.rankItem} onClick={() => onProductClick?.(p)}>
                <div className={styles.rankBadge}>
                  <span className={`${styles.rank} ${i < 3 ? styles.rankTop : ''}`}>{i + 1}위</span>
                </div>
                <ProductCard product={p} hideLike />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p style={{ fontSize: 36 }}>📦</p>
            <p className={styles.emptyText}>{selectedCategory} 카테고리 인기 중고가 없어요</p>
          </div>
        )
      )}

      {/* 인기 경매 */}
      {activeTab === 'auction' && (
        sortedAuctions.length > 0 ? (
          <div className={styles.rankList}>
            {sortedAuctions.map((item, i) => (
              <div
                key={item.id}
                className={styles.rankItem}
                onClick={() => onAuctionClick?.(item)}
              >
                <div className={styles.rankBadge}>
                  <span className={`${styles.rank} ${i < 3 ? styles.rankTop : ''}`}>{i + 1}</span>
                </div>
                <div className={styles.auctionRow}>
                  <div className={styles.auctionImgWrap}>
                    <img src={item.image} alt={item.name} className={styles.auctionImg} />
                    {item.isLive && (
                      <div className={styles.liveBadge}>
                        <span className={styles.liveDot} />LIVE
                      </div>
                    )}
                  </div>
                  <div className={styles.auctionBody}>
                    <p className={styles.auctionName}>{item.name}</p>
                    <p className={styles.auctionCategory}>{item.category}</p>
                    <p className={styles.auctionPrice}> {item.currentPrice.toLocaleString()}</p>
                    <div className={styles.auctionMeta}>
                      <span className={styles.auctionTimer}>⏱ {formatTime(item.timeLeft)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p style={{ fontSize: 36 }}>🔨</p>
            <p className={styles.emptyText}>{selectedCategory} 카테고리 인기 경매가 없어요</p>
          </div>
        )
      )}
    </main>
  );
};

export default PopularPage;
