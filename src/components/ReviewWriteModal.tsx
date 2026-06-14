import React, { useState } from 'react';
import styles from './ReviewWriteModal.module.css';

interface Props {
  productName: string;
  productImage?: string | null;
  submitting?: boolean;
  onSubmit: (rating: number, content: string) => void;
  onClose: () => void;
}

const ThumbUp = ({ filled }: { filled: boolean }) => (
  <svg
    width="34"
    height="34"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
    <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
  </svg>
);

const RATING_LABELS = ['', '별로예요', '아쉬워요', '보통이에요', '좋아요', '최고예요'];

const ReviewWriteModal: React.FC<Props> = ({
  productName,
  productImage,
  submitting = false,
  onSubmit,
  onClose,
}) => {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [content, setContent] = useState('');

  const active = hover || rating;
  const handleClose = () => {
    if (!submitting) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className={styles.close}
          onClick={handleClose}
          aria-label="닫기"
          disabled={submitting}
        >
          ✕
        </button>

        <h3 className={styles.title}>거래 후기 남기기</h3>

        <div className={styles.productBox}>
          {productImage && <img src={productImage} alt={productName} className={styles.productImg} />}
          <span className={styles.productName}>{productName}</span>
        </div>

        <p className={styles.label}>판매자와의 거래는 어떠셨나요?</p>

        <div className={styles.thumbs} role="radiogroup" aria-label="평점">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n}점`}
              className={`${styles.thumbBtn} ${n <= active ? styles.thumbActive : ''}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
            >
              <ThumbUp filled={n <= active} />
            </button>
          ))}
        </div>
        <p className={styles.ratingLabel}>{RATING_LABELS[active]}</p>

        <textarea
          className={styles.textarea}
          placeholder="거래 경험을 자유롭게 남겨주세요. (선택)"
          maxLength={1000}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={handleClose} disabled={submitting}>
            취소
          </button>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={() => onSubmit(rating, content.trim())}
            disabled={submitting}
          >
            {submitting ? '등록 중...' : '후기 등록'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewWriteModal;
