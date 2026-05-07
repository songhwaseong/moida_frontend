import React from 'react';
import type { Product, ProductTag } from '../types';
import styles from './ProductCard.module.css';

const TAG_LABEL: Record<ProductTag, string> = {
  new: '거의새것',
  auction: '경매가능',
  free: '나눔',
  good: '상태양호',
};

interface ProductCardProps {
  product: Product;
  onClick?: (product: Product) => void;
  hideLike?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, hideLike = false }) => {
  return (
    <div className={styles.card} onClick={() => onClick?.(product)}>
      <div className={styles.imgWrapper}>
        <img src={product.image} alt={product.name} className={styles.img} />
        <span className={styles.condition}>{product.condition}</span>
      </div>
      <div className={styles.body}>
        <p className={styles.title}>{product.name}</p>
        <p className={styles.meta}>{product.location} · {product.timeAgo}</p>
        <p className={styles.price}> {product.price.toLocaleString()}</p>
        <div className={styles.tags}>
          {product.tags.filter(tag => tag !== 'free' && tag !== 'auction').map((tag) => (
            <span key={tag} className={`${styles.tag} ${styles[tag]}`}>
              {TAG_LABEL[tag]}
            </span>
          ))}
        </div>
        {!hideLike && (
          <div className={styles.footer}>
            <span className={styles.heartIcon}>❤️</span>
            <span className={styles.likeCount}>관심 {product.likeCount}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
