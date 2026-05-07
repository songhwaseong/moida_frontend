import React from 'react';
import type { MainTab } from '../types';
import styles from './MainTabs.module.css';

const TABS: MainTab[] = ['홈', '경매', '인기', '관심목록'];

interface MainTabsProps {
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
}

const MainTabs: React.FC<MainTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className={styles.tabs}>
      {TABS.map((tab) => (
        <button
          key={tab}
          className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default MainTabs;
