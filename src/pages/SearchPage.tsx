import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import AuctionCard from '../components/AuctionCard';
import { PRODUCTS, AUCTION_ITEMS } from '../data/mockData';
import type { Product, AuctionItem } from '../types';
import styles from './SearchPage.module.css';

const RECENT = ['나이키 에어맥스', '맥북 프로', '샤넬', 'PS5', '소파'];

interface Props {
  onProductClick?: (product: Product) => void;
  onAuctionClick?: (item: AuctionItem) => void;
  initialQuery?: string;
  onQueryClear?: () => void;
}

type SearchTab = '전체' | '경매예정' | '경매';

const SearchPage: React.FC<Props> = ({ onProductClick, onAuctionClick, initialQuery = '', onQueryClear }) => {
  const [query, setQuery] = useState(initialQuery);
  const [recentList, setRecentList] = useState(RECENT);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);
  const [activeTab, setActiveTab] = useState<SearchTab>('전체');

  const q = query.trim().toLowerCase();
  const filteredProducts = q
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.toString().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.location.includes(q)
      )
    : [];

  const filteredAuctions = q
    ? AUCTION_ITEMS.filter((a) =>
        a.name.toLowerCase().includes(q) ||
        a.auctionNo.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      )
    : [];

  const visibleProducts = activeTab === '경매' ? [] : filteredProducts;
  const visibleAuctions = activeTab === '경매예정' ? [] : filteredAuctions;
  const totalCount = visibleProducts.length + visibleAuctions.length;

  const handleSearch = (keyword: string) => {
    setQuery(keyword);
    if (keyword.trim() && !recentList.includes(keyword)) {
      setRecentList((prev) => [keyword, ...prev].slice(0, 8));
    }
  };

  const removeRecent = (keyword: string) => {
    setRecentList((prev) => prev.filter((r) => r !== keyword));
  };

  return (
    <main className={styles.main}>
      {/* 검색바 */}
      <div className={styles.searchBar}>
        <svg width="16" height="16" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          autoFocus
          type="text"
          placeholder="상품명, 상품번호로 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
        />
        {query && <button className={styles.clear} onClick={() => { setQuery(''); onQueryClear?.(); }}>✕</button>}
      </div>

      {!query ? (
        <>
          {/* 최근 검색어 */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>최근 검색어</span>
              <button className={styles.clearAll} onClick={() => setRecentList([])}>전체 삭제</button>
            </div>
            {recentList.length > 0 ? (
              <div className={styles.recentList}>
                {recentList.map((r) => (
                  <div key={r} className={styles.recentRow}>
                    <button className={styles.recentItem} onClick={() => handleSearch(r)}>
                      <svg width="14" height="14" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {r}
                    </button>
                    <button className={styles.removeBtn} onClick={() => removeRecent(r)}>✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noRecent}>최근 검색어가 없어요</p>
            )}
          </section>

          {/* 추천 상품 */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>✨ 추천 상품</span>
            </div>
            <div className={styles.productGrid}>
              {PRODUCTS.slice(0, 2).map((p) => (
                <div key={p.id} onClick={() => onProductClick?.(p)}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <section className={styles.resultSection}>
          {/* 탭 */}
          <div className={styles.tabs}>
            {(['전체', '경매예정', '경매'] as SearchTab[]).map((t) => (
              <button
                key={t}
                className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(t)}
              >
                {t}
                {t === '전체' && totalCount > 0 && <span className={styles.tabCount}>{totalCount}</span>}
                {t === '경매예정' && filteredProducts.length > 0 && <span className={styles.tabCount}>{filteredProducts.length}</span>}
                {t === '경매' && filteredAuctions.length > 0 && <span className={styles.tabCount}>{filteredAuctions.length}</span>}
              </button>
            ))}
          </div>

          {totalCount > 0 ? (
            <div className={styles.resultList}>
              {/* 중고 결과 */}
              {visibleProducts.length > 0 && (
                <>
                  {activeTab === '전체' && <p className={styles.resultLabel}>경매예정 상품 {visibleProducts.length}개</p>}
                  <div className={styles.productGrid}>
                    {visibleProducts.map((p) => (
                      <div key={p.id} onClick={() => onProductClick?.(p)}>
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* 경매 결과 */}
              {visibleAuctions.length > 0 && (
                <>
                  {activeTab === '전체' && <p className={styles.resultLabel}>경매 상품 {visibleAuctions.length}개</p>}
                  <div className={styles.productGrid}>
                    {visibleAuctions.map((a) => (
                      <AuctionCard key={a.id} item={a} onClick={onAuctionClick} />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.empty}>
              <p style={{ fontSize: 36 }}>🔍</p>
              <p className={styles.emptyText}>'{query}'에 대한 결과가 없어요</p>
              <p className={styles.emptySubText}>다른 키워드로 검색해보세요</p>
            </div>
          )}
        </section>
      )}
    </main>
  );
};

export default SearchPage;
