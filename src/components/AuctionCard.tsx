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
  }, [seconds]);

  const pad = (n: number) => String(n).padStart(2, '0');
  const days = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  let display: string;
  if (days >= 1) {
    display = h > 0 ? `${days}일 ${h}시간` : `${days}일`;
  } else if (h > 0) {
    display = `${h}:${pad(m)}:${pad(s)}`;
  } else {
    display = `${pad(m)}:${pad(s)}`;
  }

  const isUrgent = seconds > 0 && seconds <= 60;
  const isEnded = seconds <= 0;

  return { display, isUrgent, isEnded };
};

const AuctionCard: React.FC<AuctionCardProps> = ({ item, onClick }) => {
  const { display, isUrgent, isEnded } = useCountdown(item.timeLeft);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const imageFailed = failedImage === item.image;

  return (
    <div className={styles.card} onClick={() => onClick?.(item)}>
      <div className={styles.imgWrapper}>
        {/* DB 이미지 URL이 만료되거나 잘못되어도 카드 슬롯이 비지 않도록 대체 UI를 유지한다. */}
        {imageFailed || !item.image ? (
          <div className={styles.imgFallback}>
            <span>{item.name.slice(0, 2)}</span>
          </div>
        ) : (
          <img
            src={item.image}
            alt={item.name}
            className={styles.img}
            onError={() => setFailedImage(item.image)}
          />
        )}
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
