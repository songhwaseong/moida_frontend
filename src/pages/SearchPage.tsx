import { useCallback, useEffect, useMemo, useState } from 'react';
import ProductCard from '../components/ProductCard';
import AuctionCard from '../components/AuctionCard';
import { getProducts, toAuctionItem, toProduct } from '../api/products';
import type { AuctionItem, Product } from '../types';
import styles from './SearchPage.module.css';

const RECENT_SEARCH_STORAGE_KEY = 'moida_recent_searches';

interface Props {
  onProductClick?: (product: Product) => void;
  onAuctionClick?: (item: AuctionItem) => void;
  initialQuery?: string;
  onQueryClear?: () => void;
}

type SearchTab = '전체' | '경매예정' | '경매';

const matchesQuery = (value: string | number | undefined | null, query: string) =>
  String(value ?? '').toLowerCase().includes(query);

const loadRecentSearches = () => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCH_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const saveRecentSearches = (searches: string[]) => {
  localStorage.setItem(RECENT_SEARCH_STORAGE_KEY, JSON.stringify(searches));
};

function SearchPage({ onProductClick, onAuctionClick, initialQuery = '', onQueryClear }: Props) {
  const [queryState, setQueryState] = useState({ initialQuery, value: initialQuery });
  const [recentList, setRecentList] = useState<string[]>(loadRecentSearches);
  const [activeTab, setActiveTab] = useState<SearchTab>('전체');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [scheduledProducts, setScheduledProducts] = useState<Product[]>([]);
  const [liveAuctions, setLiveAuctions] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const query = queryState.initialQuery === initialQuery ? queryState.value : initialQuery;
  const setQuery = (value: string) => setQueryState({ initialQuery, value });

  const addRecentSearch = useCallback((keyword: string) => {
    const normalizedKeyword = keyword.trim();
    if (!normalizedKeyword) return;

    setRecentList((prev) => {
      // 검색 결과가 입력 즉시 바뀌므로 Enter 없이 사용한 검색어도 최근 검색어로 남긴다.
      const next = [normalizedKeyword, ...prev.filter((recent) => recent !== normalizedKeyword)].slice(0, 8);
      saveRecentSearches(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (initialQuery) {
      const timeoutId = window.setTimeout(() => addRecentSearch(initialQuery), 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [addRecentSearch, initialQuery]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return;

    const timeoutId = window.setTimeout(() => {
      addRecentSearch(normalizedQuery);
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [addRecentSearch, query]);

  useEffect(() => {
    let ignore = false;

    const loadSearchProducts = async () => {
      setIsLoading(true);

      try {
        const [recommended, scheduled, live] = await Promise.all([
          getProducts({ status: 'SCHEDULED', sort: 'popular', size: 6 }),
          getProducts({ status: 'SCHEDULED', size: 100 }),
          getProducts({ status: 'LIVE', size: 100 }),
        ]);

        if (ignore) return;

        // 탐색 탭 추천/검색 목록은 목업 대신 실제 상품 API 응답을 카드 타입으로 변환해 사용한다.
        setRecommendedProducts(recommended.map(toProduct));
        setScheduledProducts(scheduled.map(toProduct));
        setLiveAuctions(live.map(toAuctionItem));
      } catch (error) {
        if (ignore) return;
        console.error('Failed to load search products', error);
        setRecommendedProducts([]);
        setScheduledProducts([]);
        setLiveAuctions([]);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    loadSearchProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const q = query.trim().toLowerCase();

  const filteredProducts = useMemo(() => {
    if (!q) return [];

    return scheduledProducts.filter((product) =>
      matchesQuery(product.name, q) ||
      matchesQuery(product.productNo, q) ||
      matchesQuery(product.category, q) ||
      matchesQuery(product.location, q),
    );
  }, [q, scheduledProducts]);

  const filteredAuctions = useMemo(() => {
    if (!q) return [];

    return liveAuctions.filter((auction) =>
      matchesQuery(auction.name, q) ||
      matchesQuery(auction.auctionNo, q) ||
      matchesQuery(auction.category, q),
    );
  }, [q, liveAuctions]);

  const visibleProducts = activeTab === '경매' ? [] : filteredProducts;
  const visibleAuctions = activeTab === '경매예정' ? [] : filteredAuctions;
  const totalCount = visibleProducts.length + visibleAuctions.length;

  const handleSearch = (keyword: string) => {
    setQuery(keyword);
    addRecentSearch(keyword);
  };

  const removeRecent = (keyword: string) => {
    setRecentList((prev) => {
      const next = prev.filter((recent) => recent !== keyword);
      saveRecentSearches(next);
      return next;
    });
  };

  const clearRecent = () => {
    setRecentList([]);
    saveRecentSearches([]);
  };

  const clearQuery = () => {
    setQuery('');
    onQueryClear?.();
  };

  return (
    <main className={styles.main}>
      {!query ? (
        <>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>최근 검색어</span>
              <button className={styles.clearAll} onClick={clearRecent}>전체 삭제</button>
            </div>
            {recentList.length > 0 ? (
              <div className={styles.recentList}>
                {recentList.map((recent) => (
                  <div key={recent} className={styles.recentRow}>
                    <button className={styles.recentItem} onClick={() => handleSearch(recent)}>
                      <svg width="14" height="14" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {recent}
                    </button>
                    <button className={styles.removeBtn} onClick={() => removeRecent(recent)}>x</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noRecent}>최근 검색어가 없습니다.</p>
            )}
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>추천 상품</span>
            </div>
            {isLoading ? (
              <p className={styles.noRecent}>추천 상품을 불러오는 중입니다.</p>
            ) : recommendedProducts.length > 0 ? (
              <div className={styles.productGrid}>
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onClick={onProductClick} />
                ))}
              </div>
            ) : (
              <p className={styles.noRecent}>추천 상품이 없습니다.</p>
            )}
          </section>
        </>
      ) : (
        <section className={styles.resultSection}>
          <div className={styles.queryHeader}>
            <span className={styles.queryTitle}>'{query}' 검색 결과</span>
            <button className={styles.clearAll} onClick={clearQuery}>초기화</button>
          </div>

          <div className={styles.tabs}>
            {(['전체', '경매예정', '경매'] as SearchTab[]).map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                {tab === '전체' && totalCount > 0 && <span className={styles.tabCount}>{totalCount}</span>}
                {tab === '경매예정' && filteredProducts.length > 0 && <span className={styles.tabCount}>{filteredProducts.length}</span>}
                {tab === '경매' && filteredAuctions.length > 0 && <span className={styles.tabCount}>{filteredAuctions.length}</span>}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className={styles.empty}>
              <p className={styles.emptyText}>검색할 상품을 불러오는 중입니다.</p>
            </div>
          ) : totalCount > 0 ? (
            <div className={styles.resultList}>
              {visibleProducts.length > 0 && (
                <>
                  {activeTab === '전체' && <p className={styles.resultLabel}>경매예정 상품 {visibleProducts.length}개</p>}
                  <div className={styles.productGrid}>
                    {visibleProducts.map((product) => (
                      <ProductCard key={product.id} product={product} onClick={onProductClick} />
                    ))}
                  </div>
                </>
              )}

              {visibleAuctions.length > 0 && (
                <>
                  {activeTab === '전체' && <p className={styles.resultLabel}>경매 상품 {visibleAuctions.length}개</p>}
                  <div className={styles.productGrid}>
                    {visibleAuctions.map((auction) => (
                      <AuctionCard key={auction.id} item={auction} onClick={onAuctionClick} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyText}>'{query}'에 대한 결과가 없습니다.</p>
              <p className={styles.emptySubText}>다른 검색어로 검색해보세요.</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default SearchPage;
