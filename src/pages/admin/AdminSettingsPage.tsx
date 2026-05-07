import React from 'react';
import styles from './AdminSettingsPage.module.css';

export const IDLE_OPTIONS = [
  { label: '1분',  value: 1  },
  { label: '5분',  value: 5  },
  { label: '10분', value: 10 },
  { label: '30분', value: 30 },
] as const;

export type IdleMinutes = typeof IDLE_OPTIONS[number]['value'];

interface Props {
  idleMinutes: IdleMinutes;
  onChangeIdleMinutes: (v: IdleMinutes) => void;
}

const AdminSettingsPage: React.FC<Props> = ({ idleMinutes, onChangeIdleMinutes }) => {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.pageTitle}>설정</h2>

      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionTitle}>자동 로그아웃 시간</div>
            <div className={styles.sectionDesc}>지정한 시간 동안 입력이 없으면 자동으로 로그아웃됩니다.</div>
          </div>
        </div>

        <div className={styles.optionGroup}>
          {IDLE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`${styles.optionBtn} ${idleMinutes === opt.value ? styles.optionBtnActive : ''}`}
              onClick={() => onChangeIdleMinutes(opt.value)}
            >
              {opt.label}
              {idleMinutes === opt.value && <span className={styles.optionCheck}>✓</span>}
            </button>
          ))}
        </div>

        <p className={styles.currentInfo}>
          현재 설정: <strong>{idleMinutes}분</strong> 후 자동 로그아웃
        </p>
      </section>
    </div>
  );
};

export default AdminSettingsPage;
