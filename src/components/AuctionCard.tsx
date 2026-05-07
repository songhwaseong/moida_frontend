import React, { useState, useEffect } from 'react';
import type { AuctionItem } from '../types';
import styles from './AuctionCard.module.css';

interface AuctionCardProps {
  item: AuctionItem;
  onClick?: (item: AuctionItem) => void;
}

const useCountdown = (initialSeconds: number) => {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const display = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;

  const isUrgent = seconds > 0 && seconds <= 60;
  const isEnded  = seconds <= 0;

  return { display, isUrgent, isEnded };
};

const AuctionCard: React.FC<AuctionCardProps> = ({ item, onClick }) => {
  const { display, isUrgent, isEnded } = useCountdown(item.timeLeft);

  return (
    <div className={styles.card} onClick={() => onClick?.(item)}>
      <div className={styles.imgWrapper}>
        <img src={item.image} alt={item.name} className={styles.img} />
        {item.isLive && !isEnded && (
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />LIVE
          </div>
        )}
        {isEnded ? (
          <div className={`${styles.timer} ${styles.timerEnded}`}>종료</div>
        ) : (
          <div className={`${styles.timer} ${isUrgent ? styles.timerUrgent : ''}`}>
            {display}
          </div>
        )}
      </div>
      <div className={styles.info}>
        <p className={styles.name}>{item.name}</p>
        <p className={styles.price}> {item.currentPrice.toLocaleString()}</p>
        <p className={styles.bids}>입찰 {item.bidCount}회</p>
      </div>
    </div>
  );
};

export default AuctionCard;
