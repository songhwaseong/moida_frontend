import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts, toAuctionItem, toProduct } from '../api/products';
import type { AuctionItem, Product } from '../types';
import styles from './PopularPage.module.css';

// 기간 셀렉터 UI는 유지하되 백엔드는 시간 윈도우 집계가 없어 정렬은 누적 viewCount 기준으로 동일하게 동작한다.
// 이벤트 로그 테이블이 도입되면 이 부분에서 기간별 호출 분기를 추가한다.
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

const PopularPage: React.FC<Props> = ({ selectedCategory, onProductClick, onAuctionClick }) => {
  const [period, setPeriod] = useState<Period>('오늘');
  const [activeTab, setActiveTab] = useState<'product' | 'auction'>('product');

  const [scheduledProducts, setScheduledProducts] = useState<Product[]>([]);
  const [liveAuctions, setLiveAuctions] = useState<AuctionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  // 인기 정렬은 백엔드에서 viewCount 기준으로 처리한다.
  // 카테고리 필터는 같은 API 호출에서 함께 적용한다.
  useEffect(() => {
    let ignore = false;

    const loadPopularProducts = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const [scheduled, live] = await Promise.all([
          getProducts({ status: 'SCHEDULED', sort: 'popular', category: selectedCategory ?? undefined, size: 100 }),
          getProducts({ status: 'LIVE', sort: 'popular', category: selectedCategory ?? undefined, size: 100 }),
        ]);
        if (ignore) return;
        setScheduledProducts(scheduled.map(toProduct));
        setLiveAuctions(live.map(toAuctionItem));
      } catch (err) {
        if (ignore) return;
        console.error('Failed to load popular products', err);
        setLoadError('인기 상품을 불러오지 못했어요');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadPopularProducts();

    return () => { ignore = true; };
  }, [selectedCategory]);

  return (
    <main className={styles.main}>
      {/* 기간 선택 — 현재 데이터로는 동일 결과이나 UI 자리는 유지 */}
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
          인기 중고(예정)
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

      {isLoading ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>불러오는 중...</p>
        </div>
      ) : loadError ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>{loadError}</p>
        </div>
      ) : activeTab === 'product' ? (
        scheduledProducts.length > 0 ? (
          <div className={styles.rankList}>
            {scheduledProducts.map((p, i) => (
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
            <p className={styles.emptyText}>{selectedCategory} 카테고리 인기 중고(예정)가 없어요</p>
          </div>
        )
      ) : (
        liveAuctions.length > 0 ? (
          <div className={styles.rankList}>
            {liveAuctions.map((item, i) => (
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
