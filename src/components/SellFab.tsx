import React from 'react';
import styles from './SellFab.module.css';

interface SellFabProps {
  onClick?: () => void;
}

const SellFab: React.FC<SellFabProps> = ({ onClick }) => {
  return (
    <button className={styles.fab} onClick={onClick} aria-label="판매하기">
      <svg width="16" height="16" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
        <path d="M12 5v14M5 12h14" />
      </svg>
      판매하기
    </button>
  );
};

export default SellFab;
