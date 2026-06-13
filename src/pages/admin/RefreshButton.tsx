import React from 'react';
import styles from './RefreshButton.module.css';

interface Props {
  /** 목록을 다시 불러오는 핸들러. 페이지의 load/reload 함수를 그대로 넘긴다. */
  onRefresh: () => void | Promise<void>;
  /** 조회 중 여부. true 면 버튼이 비활성화되고 아이콘이 회전한다. */
  loading?: boolean;
  /** 기본 라벨(기본값: '새로고침'). */
  label?: string;
  /** 조회 중 라벨(기본값: '조회 중'). */
  loadingLabel?: string;
  /** 추가 className(정렬 등 페이지별 보정용). */
  className?: string;
  /** loading 과 별개로 강제 비활성화하고 싶을 때. */
  disabled?: boolean;
  /**
   * 'default' — 밝은 페이지 툴바용(흰 배경 + 회색 테두리).
   * 'header'  — 어두운 관리자 헤더용(반투명 흰색, 헤더의 다른 아이콘 버튼과 동일한 룩).
   */
  variant?: 'default' | 'header';
}

/**
 * 관리자 화면 공용 새로고침 버튼.
 *
 * 각 목록 페이지가 마운트 시 호출하는 load/reload 함수를 그대로 onRefresh 로 넘기면,
 * F5(브라우저 새로고침) 없이 화면 안에서 목록을 최신 데이터로 다시 불러온다.
 * 로딩 표기·아이콘 회전·비활성화 처리를 한곳에 모아 모든 페이지에서 동일한 UX 를 보장한다.
 */
const RefreshButton: React.FC<Props> = ({
  onRefresh,
  loading = false,
  label = '새로고침',
  loadingLabel = '조회 중',
  className,
  disabled = false,
  variant = 'default',
}) => (
  <button
    type="button"
    className={`${styles.refreshBtn} ${variant === 'header' ? styles.header : ''} ${className ?? ''}`}
    onClick={() => { void onRefresh(); }}
    disabled={loading || disabled}
    aria-busy={loading}
    aria-label={loading ? loadingLabel : label}
    title="목록 새로고침"
  >
    <svg
      className={`${styles.icon} ${loading ? styles.spinning : ''}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 11a8.1 8.1 0 0 0 -15.5 -2m-.5 -4v4h4" />
      <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg>
  </button>
);

export default RefreshButton;
