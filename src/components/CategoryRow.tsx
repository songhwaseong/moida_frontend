import React from 'react';
import type { Category } from '../types';
import styles from './CategoryRow.module.css';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '전체': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  '디지털/가전': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
    </svg>
  ),
  '패션/의류': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/>
    </svg>
  ),
  '명품': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/>
      <path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  '시계/주얼리': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="7"/><path d="M12 9v3l1.5 1.5"/><path d="M9 2h6M9 22h6"/>
    </svg>
  ),
  '신발': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l5-5 4 4 4-5 5 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1v-5z"/>
    </svg>
  ),
  '스포츠/레저': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 3c-1.5 3-1.5 6 0 9s1.5 6 0 9"/><path d="M3 12c3-1.5 6-1.5 9 0s6 1.5 9 0"/>
    </svg>
  ),
  '뷰티/미용': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
    </svg>
  ),
  '게임/취미': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
      <circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="17" cy="13" r="1" fill="currentColor"/>
      <path d="M3 7h18l-1.5 9.5a2 2 0 01-2 1.5H6.5a2 2 0 01-2-1.5L3 7z"/>
    </svg>
  ),
  '음향/악기': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
    </svg>
  ),
  '한정판': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  '이월상품': (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/>
      <path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/>
      <path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/>
    </svg>
  ),
};

const CATEGORY_COLORS: Record<string, { bg: string; color: string; selectedBg: string }> = {
  '전체':      { bg: '#EDE7F6', color: '#6C63FF', selectedBg: '#6C63FF' },
  '디지털/가전': { bg: '#E3F2FD', color: '#1E88E5', selectedBg: '#1E88E5' },
  '패션/의류':  { bg: '#FCE4EC', color: '#E91E63', selectedBg: '#E91E63' },
  '명품':      { bg: '#FFF8E1', color: '#F59F00', selectedBg: '#F59F00' },
  '시계/주얼리': { bg: '#F3E5F5', color: '#9C27B0', selectedBg: '#9C27B0' },
  '신발':      { bg: '#E8F5E9', color: '#43A047', selectedBg: '#43A047' },
  '스포츠/레저': { bg: '#E0F7FA', color: '#00ACC1', selectedBg: '#00ACC1' },
  '뷰티/미용':  { bg: '#FCE4EC', color: '#EC407A', selectedBg: '#EC407A' },
  '게임/취미':  { bg: '#FBE9E7', color: '#F4511E', selectedBg: '#F4511E' },
  '음향/악기':  { bg: '#EFEBE9', color: '#6D4C41', selectedBg: '#6D4C41' },
  '한정판':    { bg: '#FFFDE7', color: '#F9A825', selectedBg: '#E53935' },
  '이월상품':   { bg: '#ECEFF1', color: '#546E7A', selectedBg: '#1E88E5' },
};

interface CategoryRowProps {
  categories: Category[];
  selectedLabel?: string | null;
  onSelect?: (category: Category) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({ categories, selectedLabel, onSelect }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        {categories.map((cat) => {
          const isSelected = cat.label === '전체'
            ? selectedLabel === null || selectedLabel === '전체'
            : selectedLabel === cat.label;
          const palette = CATEGORY_COLORS[cat.label] ?? { bg: '#F0F0F0', color: '#555', selectedBg: '#555' };
          const highlightBorder = cat.label === '한정판' ? '#1E88E5' : cat.label === '이월상품' ? '#E53935' : '#D0D3DE';
          const chipStyle = isSelected
            ? { background: palette.selectedBg, borderColor: palette.selectedBg }
            : { background: '#fff', borderColor: highlightBorder };
          const iconColor = isSelected ? '#fff' : '#6B7080';
          const labelColor = isSelected ? '#fff' : '#6B7080';
          return (
            <React.Fragment key={cat.id}>
              <button
                className={styles.chip}
                style={chipStyle}
                onClick={() => onSelect?.(cat)}
                aria-label={cat.label}
                aria-pressed={isSelected}
              >
                <div className={styles.icon} style={{ color: iconColor }}>
                  {CATEGORY_ICONS[cat.label] ?? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="9"/></svg>
                  )}
                </div>
                <span className={styles.label} style={{ color: labelColor, fontWeight: isSelected ? 700 : 500 }}>
                  {cat.label}
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryRow;
