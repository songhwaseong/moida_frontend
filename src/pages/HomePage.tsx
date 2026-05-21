import React, { useRef, useState, useEffect } from 'react';
import CategoryRow from '../components/CategoryRow';
import Banner from '../components/Banner';
import AuctionCard from '../components/AuctionCard';
import ProductCard from '../components/ProductCard';
import SectionHeader from '../components/SectionHeader';
import { CATEGORIES as FALLBACK_CATEGORIES } from '../data/mockData';
import { getProducts, toAuctionItem, toProduct } from '../api/products';
import { fetchCategories } from '../api/categories';
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
const uncategorizedOrder = Number.MAX_SAFE_INTEGER;

const HomePage: React.FC<Props> = ({
  onAuctionClick, onProductClick,
  onMoreAuction, onMoreTrade,
  selectedCategory, onCategorySelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const loadTimerRef = useRef<number | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleProductCount, setVisibleProductCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [categories, setCategories] = useState<Category[]>(FALLBACK_CATEGORIES);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 카테고리는 DB displayOrder 순으로 받아서 표시. 실패 시 mock으로 폴백.
  useEffect(() => {
    let ignore = false;
    fetchCategories()
      .then((data) => { if (!ignore) setCategories(data); })
      .catch((error) => { console.error('Failed to load categories', error); });
    return () => { ignore = true; };
  }, []);

  // Use the visible category row order as the primary sort order for home sections.
  const categoryOrder = new Map(
    categories
      .filter((category) => category.label !== '전체' && category.label !== '?꾩껜')
      .map((category, index) => [category.label, index])
  );

  const getCategoryOrder = (category: string) => categoryOrder.get(category) ?? uncategorizedOrder;

  // Upcoming products follow category order first, then newest-looking id order within each category.
  const filteredProducts = (selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products
  ).toSorted((a, b) => {
    const categoryDiff = getCategoryOrder(a.category) - getCategoryOrder(b.category);
    if (categoryDiff !== 0) return categoryDiff;
    return b.id - a.id;
  });

  // Live auctions follow category order first, then deadline-soon order within each category.
  const filteredAuctions = (selectedCategory
    ? auctions.filter((a) => a.category === selectedCategory)
    : auctions
  ).toSorted((a, b) => {
    const categoryDiff = getCategoryOrder(a.category) - getCategoryOrder(b.category);
    if (categoryDiff !== 0) return categoryDiff;
    return a.timeLeft - b.timeLeft;
  });

  const totalSlides = Math.ceil(filteredAuctions.length / CARDS_PER_SLIDE);
  const visibleProducts = filteredProducts.slice(0, visibleProductCount);
  const hasMoreProducts = visibleProductCount < filteredProducts.length;

  const goToSlide = (idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(idx, totalSlides - 1));
    el.scrollTo({ left: next * CARD_WIDTH * CARDS_PER_SLIDE, behavior: 'smooth' });
    setActiveSlide(next);
  };

  // 홈 화면의 상품/경매 목록은 목업 대신 DB 조회 API에서 가져온다.
  // 응답은 기존 ProductCard/AuctionCard 타입으로 변환해 하위 컴포넌트는 그대로 재사용한다.
  useEffect(() => {
    let ignore = false;

    const loadHomeProducts = async () => {
      setIsInitialLoading(true);
      try {
        // 실시간 경매: product.status=LIVE (+ 서버에서 auction.status=LIVE 추가 검증)
        // 경매 예정 매물: product.status=SCHEDULED
        const [liveAuctionItems, scheduledItems] = await Promise.all([
          getProducts({ status: 'LIVE', size: 100 }),
          getProducts({ status: 'SCHEDULED', size: 100 }),
        ]);

        if (ignore) return;
        setAuctions(liveAuctionItems.map(toAuctionItem));
        setProducts(scheduledItems.map(toProduct));
      } catch (error) {
        if (ignore) return;
        console.error('Failed to load home products', error);
        setProducts([]);
        setAuctions([]);
      } finally {
        if (!ignore) setIsInitialLoading(false);
      }
    };

    loadHomeProducts();

    return () => {
      ignore = true;
    };
  }, []);

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
    const timer = window.setTimeout(() => {
      setActiveSlide(0);
      setVisibleProductCount(PAGE_SIZE);
      setIsLoadingMore(false);
      if (loadTimerRef.current !== null) {
        window.clearTimeout(loadTimerRef.current);
        loadTimerRef.current = null;
      }
      const el = scrollRef.current;
      if (el) el.scrollTo({ left: 0, behavior: 'instant' });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [selectedCategory]);

  useEffect(() => {
    if (!hasMoreProducts) return;

    const root = document.getElementById('main-scroll');
    if (!root) return;

    const scheduleLoadMore = () => {
      if (loadTimerRef.current !== null || visibleProductCount >= filteredProducts.length) return;

      setIsLoadingMore(true);
      loadTimerRef.current = window.setTimeout(() => {
        setVisibleProductCount((count) => Math.min(count + PAGE_SIZE, filteredProducts.length));
        setIsLoadingMore(false);
        loadTimerRef.current = null;
      }, 700);
    };

    const handleScroll = () => {
      const doc = document.documentElement;
      const distances: number[] = [];

      if (root.scrollHeight > root.clientHeight + 1) {
        distances.push(root.scrollHeight - root.scrollTop - root.clientHeight);
      }
      if (doc.scrollHeight > window.innerHeight + 1) {
        distances.push(doc.scrollHeight - window.scrollY - window.innerHeight);
      }

      if (distances.some((distance) => distance < 220)) scheduleLoadMore();
    };

    root.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      root.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [filteredProducts.length, hasMoreProducts, visibleProductCount]);

  useEffect(() => {
    return () => {
      if (loadTimerRef.current !== null) {
        window.clearTimeout(loadTimerRef.current);
        loadTimerRef.current = null;
      }
    };
  }, []);

  return (
    <main className={styles.main}>
      <CategoryRow
        categories={categories}
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

      {isInitialLoading ? (
        <div className={styles.empty}><p>경매 상품을 불러오는 중...</p></div>
      ) : filteredAuctions.length > 0 ? (
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
        {isInitialLoading ? (
          <div className={styles.empty}><p>상품을 불러오는 중...</p></div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className={styles.productGrid}>
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={onProductClick} />
              ))}
            </div>
            <div ref={loadMoreRef} className={styles.loadMoreSentinel} aria-hidden={!hasMoreProducts && !isLoadingMore}>
              {isLoadingMore && (
                <div className={styles.loadingMore}>
                  <span className={styles.spinner} />
                  <span>불러오는 중</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={styles.empty}><p>해당 카테고리의 매물이 없어요</p></div>
        )}
      </section>
    </main>
  );
};

export default HomePage;
