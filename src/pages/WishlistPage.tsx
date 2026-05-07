import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS, AUCTION_ITEMS } from '../data/mockData';
import type { AuctionItem, Product } from '../types';
import styles from './WishlistPage.module.css';
import subStyles from './my/MySubPage.module.css';

interface Props {
  onProductClick?: (product: Product) => void;
  onAuctionClick?: (item: AuctionItem) => void;
  onBack?: () => void;
}

const formatTime = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const WishlistPage: React.FC<Props> = ({ onProductClick, onAuctionClick, onBack }) => {
  const [activeTab, setActiveTab] = useState<'product' | 'auction'>('product');

  const likedProducts = PRODUCTS.filter((p) => p.liked);
  const likedAuctions = AUCTION_ITEMS.filter((item) => item.liked);

  return (
    <main className={styles.main}>
      <div className={onBack ? subStyles.header : styles.header}>
        {onBack ? (
          <>
            <button className={subStyles.back} onClick={onBack}>
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 5l-7 7 7 7"/>
              </svg>
            </button>
            <span className={subStyles.title}>관심 목록</span>
            <div style={{ width: 32 }}/>
          </>
        ) : (
          <h1 className={styles.title}>관심 목록</h1>
        )}
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'product' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('product')}
        >중고 {likedProducts.length}</button>
        <button
          className={`${styles.tab} ${activeTab === 'auction' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('auction')}
        >경매 {likedAuctions.length}</button>
      </div>

      <div className={styles.content}>
        {activeTab === 'product' ? (
          likedProducts.length > 0 ? (
            <div className={styles.productGrid}>
              {likedProducts.map((p) => (
                <div key={p.id} onClick={() => onProductClick?.(p)}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p style={{ fontSize: 40 }}>🤍</p>
              <p className={styles.emptyText}>관심 상품이 없어요</p>
              <p className={styles.emptySubText}>마음에 드는 상품에 하트를 눌러보세요</p>
            </div>
          )
        ) : (
          likedAuctions.length > 0 ? (
            <div className={styles.auctionGrid}>
              {likedAuctions.map((item) => (
                <div
                  key={item.id}
                  className={styles.auctionItem}
                  onClick={() => onAuctionClick?.(item)}
                >
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
                        <span className={styles.auctionBids}>입찰 {item.bidCount}회</span>
                        <span className={styles.auctionTimer}>⏱ {formatTime(item.timeLeft)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p style={{ fontSize: 40 }}>🔨</p>
              <p className={styles.emptyText}>관심 경매가 없어요</p>
              <p className={styles.emptySubText}>경매에 참여하거나 관심을 등록해보세요</p>
            </div>
          )
        )}
      </div>
    </main>
  );
};

export default WishlistPage;
