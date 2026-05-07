import React, { useState } from 'react';
import styles from './TopBar.module.css';

const BellIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const ChatIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

interface TopBarProps {
  notificationCount?: number;
  messageCount?: number;
  onBellClick?: () => void;
  onChatClick?: () => void;
  onSearch?: (query: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  notificationCount = 3,
  messageCount = 1,
  onBellClick,
  onChatClick,
  onSearch,
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (query.trim()) onSearch?.(query.trim());
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.row}>
        <div className={styles.logo}>MOIDA</div>
        <div className={styles.icons}>
          <button className={styles.iconBtn} aria-label="알림" onClick={onBellClick}>
            <BellIcon />
            {notificationCount > 0 && <span className={styles.badge}>{notificationCount}</span>}
          </button>
        </div>
      </div>
      <div className={styles.searchBar}>
        <button className={styles.searchIconBtn} onClick={handleSearch} aria-label="검색">
          <SearchIcon />
        </button>
        <input
          type="text"
          placeholder="브랜드, 상품명으로 검색"
          aria-label="검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        {query && (
          <button className={styles.clearBtn} onClick={() => setQuery('')}>✕</button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
