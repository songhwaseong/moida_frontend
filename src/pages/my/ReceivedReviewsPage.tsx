import React, { useState } from 'react';
import { reviewStore } from '../../data/reviewStore';
import styles from './MySubPage.module.css';

interface Props { onBack: () => void; }

const ReceivedReviewsPage: React.FC<Props> = ({ onBack }) => {
  // reviewStore 변경 감지를 위한 forceUpdate
  const [, forceUpdate] = useState(0);
  const reviews = reviewStore;

  const ThumbUp = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
    </svg>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.title}>받은 후기</span>
        <div style={{width:32}}/>
      </div>
      <div className={styles.list}>
        {reviews.length === 0 ? (
          <div className={styles.empty}>
            <p style={{ fontSize: 40, color: '#E24B4A' }}>👍</p>
            <p className={styles.emptyText}>아직 받은 후기가 없어요</p>
          </div>
        ) : reviews.map(r => (
          <div key={r.id} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <span className={styles.reviewUser}>{r.user}</span>
              <span className={styles.reviewDate}>{r.date}</span>
            </div>
            <div className={styles.stars} style={{ display: 'flex', gap: 3, color: '#E24B4A' }}>
              {Array.from({ length: r.stars }).map((_, i) => <ThumbUp key={i} />)}
            </div>
            <p className={styles.reviewText}>{r.text}</p>
            <p className={styles.reviewProduct}>📦 {r.product}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReceivedReviewsPage;
