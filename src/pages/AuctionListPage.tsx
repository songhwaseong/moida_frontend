import { useEffect, useMemo, useState } from 'react';
import AuctionCard from '../components/AuctionCard';
import ProductCard from '../components/ProductCard';
import { getProducts, toAuctionItem, toProduct } from '../api/products';
import type { AuctionItem, Product } from '../types';
import styles from './AuctionListPage.module.css';

interface Props {
  onItemClick: (item: AuctionItem) => void;
  onProductClick: (product: Product) => void;
  selectedCategory?: string | null;
}

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_COUNT = 12;

function AuctionListPage({ onItemClick, onProductClick, selectedCategory }: Props) {
  const [sortByTime, setSortByTime] = useState(true);
  const [visibleState, setVisibleState] = useState({ category: selectedCategory ?? null, count: INITIAL_VISIBLE_COUNT });
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // 상단 카테고리가 바뀔 때마다 실제 상품 API에서 경매 상태별 목록을 다시 가져온다.
  useEffect(() => {
    let ignore = false;

    const loadAuctionProducts = async () => {
      setIsInitialLoading(true);

      try {
        const category = selectedCategory ?? undefined;
        const [liveProducts, scheduledProducts] = await Promise.all([
          getProducts({ status: 'LIVE', category, size: 100 }),
          getProducts({ status: 'SCHEDULED', category, size: 100 }),
        ]);

        if (ignore) return;

        // 경매 탭은 실제 상품 API의 LIVE/SCHEDULED 상태를 나눠서 보여준다.
        setAuctions(liveProducts.map(toAuctionItem));
        setProducts(scheduledProducts.map(toProduct));
      } catch (error) {
        if (ignore) return;
        console.error('Failed to load auction tab products', error);
        setAuctions([]);
        setProducts([]);
      } finally {
        if (!ignore) {
          setIsInitialLoading(false);
        }
      }
    };

    loadAuctionProducts();

    return () => {
      ignore = true;
    };
  }, [selectedCategory]);

  // 진행중인 경매는 사용자가 고른 정렬 기준에 맞춰 마감임박순 또는 입찰많은순으로 보여준다.
  const filtered = useMemo(() => {
    return [...auctions].sort((a, b) =>
      sortByTime ? a.timeLeft - b.timeLeft : b.bidCount - a.bidCount,
    );
  }, [auctions, sortByTime]);

  // 경매 예정 매물은 SCHEDULED 상품 중 경매 가능 상품만 대상으로 무한스크롤 처리한다.
  const upcomingAll = products.filter((product) => product.canAuction);
  const selectedCategoryKey = selectedCategory ?? null;
  const visibleCount = visibleState.category === selectedCategoryKey ? visibleState.count : INITIAL_VISIBLE_COUNT;
  const visibleUpcoming = upcomingAll.slice(0, visibleCount);
  const hasMore = visibleCount < upcomingAll.length;

  // 하단 근처까지 스크롤하면 다음 묶음을 추가로 노출한다.
  useEffect(() => {
    const handleScroll = () => {
      if (isInitialLoading || isLoadingMore || !hasMore) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollTop + windowHeight >= documentHeight - 200) {
        setIsLoadingMore(true);

        setTimeout(() => {
          setVisibleState((prev) => ({
            category: selectedCategoryKey,
            count: Math.min((prev.category === selectedCategoryKey ? prev.count : INITIAL_VISIBLE_COUNT) + LOAD_MORE_COUNT, upcomingAll.length),
          }));
          setIsLoadingMore(false);
        }, 500);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isInitialLoading, isLoadingMore, selectedCategoryKey, upcomingAll.length]);

  return (
    <div className={styles.main}>
      <div className={styles.topBar}>
        <div className={styles.sortToggle}>
          <button
            className={`${styles.toggleBtn} ${sortByTime ? styles.toggleActive : ''}`}
            onClick={() => setSortByTime(true)}
          >
            마감임박순
          </button>
          <button
            className={`${styles.toggleBtn} ${!sortByTime ? styles.toggleActive : ''}`}
            onClick={() => setSortByTime(false)}
          >
            입찰많은순
          </button>
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.liveLabel}>
            <span className={styles.liveDot} />
            LIVE
          </span>
          <h2 className={styles.sectionTitle}>진행중인 경매</h2>
        </div>

        {isInitialLoading ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>경매 상품을 불러오는 중입니다.</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className={styles.grid}>
            {filtered.map((item) => (
              <AuctionCard key={item.id} item={item} onClick={onItemClick} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>진행중인 경매가 없습니다.</p>
          </div>
        )}
      </section>

      {!isInitialLoading && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>경매 예정 매물</h2>
          </div>

          {upcomingAll.length > 0 ? (
            <>
              <div className={styles.productGrid}>
                {visibleUpcoming.map((product) => (
                  <ProductCard key={product.id} product={product} onClick={onProductClick} />
                ))}
              </div>

              <div className={styles.loaderArea}>
                {isLoadingMore ? (
                  <div className={styles.loadingSpinner}>
                    <div className={styles.spinner} />
                    <span>더 많은 상품을 불러오는 중...</span>
                  </div>
                ) : !hasMore ? (
                  <p className={styles.noMore}>모든 경매 예정 매물을 불러왔습니다.</p>
                ) : null}
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyText}>경매 예정 매물이 없습니다.</p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export default AuctionListPage;
