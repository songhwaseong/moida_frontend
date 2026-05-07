import React, { useState, useEffect } from 'react';
import AuctionCard from '../components/AuctionCard';
import ProductCard from '../components/ProductCard';
import { AUCTION_ITEMS, PRODUCTS } from '../data/mockData';
import type { AuctionItem, Product } from '../types';
import styles from './AuctionListPage.module.css';

const PAGE_SIZE = 9;

interface Props {
  onItemClick: (item: AuctionItem) => void;
  onProductClick?: (product: Product) => void;
  selectedCategory?: string | null;
}

const AuctionListPage: React.FC<Props> = ({ onItemClick, onProductClick, selectedCategory }) => {
  const [sortByTime, setSortByTime] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(false);

  const filtered = selectedCategory
    ? AUCTION_ITEMS.filter((item) => item.category === selectedCategory)
    : AUCTION_ITEMS;

  const sorted = [...filtered].sort((a, b) =>
    sortByTime ? a.timeLeft - b.timeLeft : b.bidCount - a.bidCount
  );

  const upcomingAll = selectedCategory
    ? PRODUCTS.filter((p) => p.canAuction && p.category === selectedCategory)
    : PRODUCTS.filter((p) => p.canAuction);

  const upcomingVisible = upcomingAll.slice(0, visibleCount);
  const hasMore = visibleCount < upcomingAll.length;

  // #main-scroll 컨테이너 스크롤 감지
  useEffect(() => {
    const container = document.getElementById('main-scroll');
    if (!container) return;

    const handleScroll = () => {
      if (isLoading || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollTop + clientHeight >= scrollHeight - 120) {
        setIsLoading(true);
        setTimeout(() => {
          setVisibleCount((prev) => prev + PAGE_SIZE);
          setIsLoading(false);
        }, 500);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [hasMore, isLoading]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [selectedCategory]);

  return (
    <main className={styles.main}>
      <div className={styles.topBar}>
        <div className={styles.sortToggle}>
          <button
            className={`${styles.toggleBtn} ${sortByTime ? styles.toggleActive : ''}`}
            onClick={() => setSortByTime(true)}
          >마감임박순</button>
          <button
            className={`${styles.toggleBtn} ${!sortByTime ? styles.toggleActive : ''}`}
            onClick={() => setSortByTime(false)}
          >입찰많은순</button>
        </div>
      </div>

      {/* 진행중인 경매 */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.liveLabel}><span className={styles.liveDot} />LIVE</span>
          <span className={styles.sectionTitle}>
            진행중인 경매 {sorted.length}건
            {selectedCategory && <span className={styles.categoryBadge}>{selectedCategory}</span>}
          </span>
        </div>
        {sorted.length > 0 ? (
          <div className={styles.grid}>
            {sorted.map((item) => (
              <div key={item.id} onClick={() => onItemClick(item)}>
                <AuctionCard item={item} />
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p style={{ fontSize: 36 }}>🔨</p>
            <p className={styles.emptyText}>{selectedCategory} 카테고리 경매가 없어요</p>
          </div>
        )}
      </div>

      {/* 경매예정 매물 */}
      {upcomingAll.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.upcomingLabel}>예정</span>
            <span className={styles.sectionTitle}>
              경매예정 매물 {upcomingAll.length}건
            </span>
          </div>
          <div className={styles.productGrid}>
            {upcomingVisible.map((p) => (
              <div key={p.id} onClick={() => onProductClick?.(p)}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
          <div className={styles.loaderArea}>
            {isLoading && (
              <div className={styles.loadingSpinner}>
                <div className={styles.spinner} />
                <span>불러오는 중...</span>
              </div>
            )}
            {!hasMore && upcomingAll.length > PAGE_SIZE && (
              <p className={styles.noMore}>모든 경매예정 매물을 불러왔어요 ✓</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
};

export default AuctionListPage;
