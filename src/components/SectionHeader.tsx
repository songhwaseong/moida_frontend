import React from 'react';
import styles from './SectionHeader.module.css';

interface SectionHeaderProps {
  title: string;
  onMoreClick?: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onMoreClick }) => {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <button className={styles.more} onClick={onMoreClick}>더보기 →</button>
    </div>
  );
};

export default SectionHeader;
