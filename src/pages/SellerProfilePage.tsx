import React, { useEffect, useState } from 'react';
import { getSellerProducts, toProduct } from '../api/products';
import { getMemberReceivedReviews, type ReceivedReviewDto } from '../api/reviews';
import type { Product } from '../types';
import ProductCard from '../components/ProductCard';
import styles from './SellerProfilePage.module.css';

interface SellerInfo {
  id: number;
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

interface SellerProductsState {
  sellerId: number;
  items: Product[];
  loading: boolean;
  error: string;
}

interface SellerReviewsState {
  sellerId: number;
  items: ReceivedReviewDto[];
  loading: boolean;
  error: string;
}

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const ratingCount = (rating: number) => Math.max(0, Math.min(5, Math.round(rating)));

const ThumbUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ display: 'inline', verticalAlign: 'middle' }}>
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
  </svg>
);

const SellerProfilePage: React.FC<Props> = ({ seller, onBack, onProductClick }) => {
  const [activeTab, setActiveTab] = useState<'selling' | 'reviews'>('selling');
  const [barWidth, setBarWidth] = useState(0);
  const [productsState, setProductsState] = useState<SellerProductsState>({
    sellerId: seller.id,
    items: [],
    loading: true,
    error: '',
  });
  const [reviewsState, setReviewsState] = useState<SellerReviewsState>({
    sellerId: seller.id,
    items: [],
    loading: true,
    error: '',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setBarWidth(Math.min(100, Math.max(0, ((seller.temp - 30) / 20) * 100)));
    }, 300);
    return () => clearTimeout(timer);
  }, [seller.temp]);

  useEffect(() => {
    let active = true;

    getSellerProducts(seller.id)
      .then((products) => {
        if (!active) return;
        setProductsState({
          sellerId: seller.id,
          items: products.map(toProduct),
          loading: false,
          error: '',
        });
      })
      .catch((error) => {
        if (!active) return;
        console.error('Failed to load seller products', error);
        setProductsState({
          sellerId: seller.id,
          items: [],
          loading: false,
          error: '판매 상품을 불러오지 못했어요.',
        });
      });

    return () => {
      active = false;
    };
  }, [seller.id]);

  useEffect(() => {
    let active = true;

    getMemberReceivedReviews(seller.id)
      .then((nextReviews) => {
        if (!active) return;
        setReviewsState({
          sellerId: seller.id,
          items: nextReviews,
          loading: false,
          error: '',
        });
      })
      .catch((error) => {
        if (!active) return;
        console.error('Failed to load seller reviews', error);
        setReviewsState({
          sellerId: seller.id,
          items: [],
          loading: false,
          error: '받은 후기를 불러오지 못했어요.',
        });
      });

    return () => {
      active = false;
    };
  }, [seller.id]);

  const tempColor = seller.temp >= 38 ? '#E24B4A' : seller.temp >= 36.5 ? '#EF9F27' : '#5B9BD5';
  const sellerProducts = productsState.sellerId === seller.id ? productsState.items : [];
  const productsLoading = productsState.sellerId !== seller.id || productsState.loading;
  const productsError = productsState.sellerId === seller.id ? productsState.error : '';
  const reviews = reviewsState.sellerId === seller.id ? reviewsState.items : [];
  const reviewsLoading = reviewsState.sellerId !== seller.id || reviewsState.loading;
  const reviewsError = reviewsState.sellerId === seller.id ? reviewsState.error : '';
  const avgStars = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '-';

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className={styles.title}>판매자 프로필</span>
        <div style={{ width: 32 }} />
      </div>

      <div className={styles.scroll}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>👤</div>
          <div className={styles.profileInfo}>
            <p className={styles.name}>{seller.name}</p>
            <p className={styles.location}>📍 {seller.location || '-'}</p>

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

        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{seller.sales}</span>
            <span className={styles.statLabel}>거래 횟수</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>{avgStars}</span>
            <span className={styles.statLabel}>평균 평점</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>{sellerProducts.length}</span>
            <span className={styles.statLabel}>판매중</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statItem}>
            <span className={styles.statNum}>{reviews.length}</span>
            <span className={styles.statLabel}>후기</span>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'selling' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('selling')}
          >
            판매 상품 {sellerProducts.length}
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'reviews' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            받은 후기 {reviews.length}
          </button>
        </div>

        {activeTab === 'selling' && (
          <div className={styles.productList}>
            {productsLoading ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>판매 상품을 불러오는 중...</p>
              </div>
            ) : productsError ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>{productsError}</p>
              </div>
            ) : sellerProducts.length > 0 ? (
              sellerProducts.map((product) => (
                <ProductCard key={product.id} product={product} onClick={onProductClick} />
              ))
            ) : (
              <div className={styles.empty}>
                <p style={{ fontSize: 36 }}>🛍️</p>
                <p className={styles.emptyText}>판매중인 상품이 없어요</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className={styles.reviewList}>
            {reviewsLoading ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>받은 후기를 불러오는 중...</p>
              </div>
            ) : reviewsError ? (
              <div className={styles.empty}>
                <p className={styles.emptyText}>{reviewsError}</p>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className={styles.reviewItem}>
                  <div className={styles.reviewHeader}>
                    <div className={styles.reviewUser}>
                      <div className={styles.reviewAvatar}>{review.reviewerAvatar || '👤'}</div>
                      <span className={styles.reviewName}>{review.reviewerNickname}</span>
                    </div>
                    <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                  </div>
                  <div className={styles.stars} style={{ display: 'flex', gap: 3, color: '#E24B4A' }}>
                    {Array.from({ length: ratingCount(review.rating) }).map((_, index) => <ThumbUp key={index} />)}
                  </div>
                  <p className={styles.reviewText}>{review.content || '내용 없는 후기입니다.'}</p>
                  <p className={styles.reviewDate}>{review.productName}</p>
                </div>
              ))
            ) : (
              <div className={styles.empty}>
                <p style={{ fontSize: 36 }}>💬</p>
                <p className={styles.emptyText}>아직 받은 후기가 없어요</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerProfilePage;
