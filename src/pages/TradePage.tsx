import React, { useState } from 'react';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/mockData';
import type { Product } from '../types';
import styles from './TradePage.module.css';

const SORTS = ['최신순', '낮은가격순', '높은가격순', '관심많은순'];

interface Props {
  onProductClick: (product: Product) => void;
  selectedCategory?: string | null;
}

const TradePage: React.FC<Props> = ({ onProductClick, selectedCategory }) => {
  const [activeSort, setActiveSort] = useState('최신순');
  const [showSort, setShowSort] = useState(false);

  const filtered = selectedCategory
    ? PRODUCTS.filter((p) => p.category === selectedCategory)
    : PRODUCTS;

  const sorted = [...filtered].sort((a, b) => {
    if (activeSort === '낮은가격순') return a.price - b.price;
    if (activeSort === '높은가격순') return b.price - a.price;
    if (activeSort === '관심많은순') return b.likeCount - a.likeCount;
    return 0;
  });

  return (
    <main className={styles.main}>
      <div className={styles.sortRow}>
        <span className={styles.resultCount}>
          총 {sorted.length}개
          {selectedCategory && <span className={styles.categoryBadge}>{selectedCategory}</span>}
        </span>
        <div style={{ position: 'relative' }}>
          <button className={styles.sortBtn} onClick={() => setShowSort((p) => !p)}>
            {activeSort} ▾
          </button>
          {showSort && (
            <div className={styles.sortDropdown}>
              {SORTS.map((s) => (
                <button
                  key={s}
                  className={`${styles.sortItem} ${activeSort === s ? styles.sortActive : ''}`}
                  onClick={() => { setActiveSort(s); setShowSort(false); }}
                >{s}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.list}>
        {sorted.length > 0 ? (
          sorted.map((p) => (
            <div key={p.id} onClick={() => onProductClick(p)}>
              <ProductCard product={p} />
            </div>
          ))
        ) : (
          <div className={styles.empty}>
            <p style={{ fontSize: 36 }}>🔍</p>
            <p className={styles.emptyText}>{selectedCategory} 카테고리 매물이 없어요</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default TradePage;
