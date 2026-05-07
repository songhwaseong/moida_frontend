import React, { useRef, useState, useEffect } from 'react';
import CategoryRow from '../components/CategoryRow';
import Banner from '../components/Banner';
import AuctionCard from '../components/AuctionCard';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { CATEGORIES, AUCTION_ITEMS, PRODUCTS } from '../data/mockData';
import type { AuctionItem, Category, Product } from '../types';
import styles from './HomePage.module.css';

interface Props {
  onAuctionClick?: (item: AuctionItem) => void;
  onProductClick?: (product: Product) => void;
  onMoreAuction?: () => void;
  onMoreTrade?: () => void;
  selectedCategory?: string | null;
  onCategorySelect?: (cat: Category) => void;
}

const CARD_WIDTH = 190 + 14;
const CARDS_PER_SLIDE = 3;
const PAGE_SIZE = 9;
const AUTO_INTERVAL = 3000;

const HomePage: React.FC<Props> = ({
  onAuctionClick, onProductClick,
  onMoreAuction, onMoreTrade,
  selectedCategory, onCategorySelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [page, setPage] = useState(1);

  const filteredProducts = selectedCategory
    ? PRODUCTS.filter((p) => p.category === selectedCategory)
    : PRODUCTS;

  const filteredAuctions = selectedCategory
    ? AUCTION_ITEMS.filter((a) => a.category === selectedCategory)
    : AUCTION_ITEMS;

  const totalSlides = Math.ceil(filteredAuctions.length / CARDS_PER_SLIDE);
  const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
  const pagedProducts = filteredProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goToSlide = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(idx, totalSlides - 1));
    el.scrollTo({ left: next * CARD_WIDTH * CARDS_PER_SLIDE, behavior: 'smooth' });
    setActiveSlide(next);
  };

  // 자동 슬라이드
  useEffect(() => {
    if (isHovered || filteredAuctions.length === 0) return;
    const timer = setInterval(() => {
      setActiveSlide(prev => {
        const next = prev >= totalSlides - 1 ? 0 : prev + 1;
        const el = scrollRef.current;
        if (el) el.scrollTo({ left: next * CARD_WIDTH * CARDS_PER_SLIDE, behavior: 'smooth' });
        return next;
      });
    }, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [isHovered, filteredAuctions.length, totalSlides]);

  // 카테고리 변경 시 초기화
  useEffect(() => {
    setActiveSlide(0);
    setPage(1);
    const el = scrollRef.current;
    if (el) el.scrollTo({ left: 0, behavior: 'instant' });
  }, [selectedCategory]);

  return (
    <main className={styles.main}>
      <CategoryRow
        categories={CATEGORIES}
        selectedLabel={selectedCategory}
        onSelect={onCategorySelect}
      />

      {selectedCategory && (
        <div className={styles.filterBanner}>
          <span><strong>{selectedCategory}</strong> 카테고리 필터 중</span>
          <button className={styles.filterClear} onClick={() => onCategorySelect?.({ id: 0, emoji: '', label: selectedCategory })}>
            전체보기 ✕
          </button>
        </div>
      )}

      {!selectedCategory && (
        <Banner
          title="오늘의 핫딜 경매<br/>지금 바로 참여하세요"
          subtitle="최대 90% 할인된 가격으로"
          cta="참여하기"
          onClick={onMoreAuction}
        />
      )}

      {/* 실시간 경매 */}
      <div className={styles.sectionHead}>
        <SectionHeader title="🔴 실시간 경매" onMoreClick={onMoreAuction} />
      </div>

      {filteredAuctions.length > 0 ? (
        <div
          className={styles.carouselWrap}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 왼쪽 화살표 */}
          <button
            className={`${styles.arrow} ${styles.arrowLeft} ${activeSlide === 0 ? styles.arrowHidden : ''}`}
            onClick={() => goToSlide(activeSlide - 1)}
            aria-label="이전"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {/* 카드 스크롤 영역 */}
          <div ref={scrollRef} className={styles.carouselScroll}>
            {filteredAuctions.map((item) => (
              <div key={item.id} className={styles.carouselItem}>
                <AuctionCard item={item} onClick={onAuctionClick} />
              </div>
            ))}
          </div>

          {/* 오른쪽 화살표 */}
          <button
            className={`${styles.arrow} ${styles.arrowRight} ${activeSlide >= totalSlides - 1 ? styles.arrowHidden : ''}`}
            onClick={() => goToSlide(activeSlide + 1)}
            aria-label="다음"
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {/* 인디케이터 도트 */}
          {totalSlides > 1 && (
            <div className={styles.dots}>
              {Array.from({ length: totalSlides }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.dot} ${activeSlide === i ? styles.dotActive : ''}`}
                  onClick={() => goToSlide(i)}
                  aria-label={`${i + 1}번 슬라이드`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className={styles.empty}><p>해당 카테고리의 경매가 없어요</p></div>
      )}

      {/* 경매 예정 매물 */}
      <section className={styles.section} style={{ paddingTop: 18 }}>
        <SectionHeader title="경매 예정 매물" onMoreClick={onMoreTrade} />
        {filteredProducts.length > 0 ? (
          <>
            <div className={styles.productGrid}>
              {pagedProducts.map((product) => (
                <div key={product.id} onClick={() => onProductClick?.(product)}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 18l-6-6 6-6"/>
                  </svg>
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    className={`${styles.pageNum} ${page === n ? styles.pageNumActive : ''}`}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                ))}
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.empty}><p>해당 카테고리의 매물이 없어요</p></div>
        )}
      </section>
    </main>
  );
};

export default HomePage;
