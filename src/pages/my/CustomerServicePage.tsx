import React from 'react';
import styles from './MySubPage.module.css';

interface Props { onBack: () => void; }

const CustomerServicePage: React.FC<Props> = ({ onBack }) => (
  <div className={styles.page}>
    <div className={styles.header}>
      <button className={styles.back} onClick={onBack}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>
      <span className={styles.title}>고객센터</span>
      <div style={{width:32}}/>
    </div>
    <div className={styles.list}>
      <div className={styles.csCard}>
        <p className={styles.csEmoji}>💬</p>
        <p className={styles.csTitle}>1:1 채팅 문의</p>
        <p className={styles.csDesc}>평균 응답 시간 5분 이내{'\n'}운영시간: 평일 09:00 ~ 18:00</p>
        <button className={styles.csBtn}>채팅 문의 시작</button>
      </div>
      <div className={styles.csCard}>
        <p className={styles.csEmoji}>📞</p>
        <p className={styles.csTitle}>전화 문의</p>
        <p className={styles.csDesc}>1588-0000{'\n'}운영시간: 평일 09:00 ~ 18:00</p>
        <button className={styles.csBtnOutline}>전화 연결</button>
      </div>
      <div className={styles.csCard}>
        <p className={styles.csEmoji}>📧</p>
        <p className={styles.csTitle}>이메일 문의</p>
        <p className={styles.csDesc}>support@bazar.kr{'\n'}영업일 기준 1~2일 내 답변</p>
        <button className={styles.csBtnOutline}>이메일 보내기</button>
      </div>
    </div>
  </div>
);
export default CustomerServicePage;
