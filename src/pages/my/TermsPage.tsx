import React, { useState } from 'react';
import styles from './MySubPage.module.css';

const TABS = ['이용약관', '개인정보처리방침'];
interface Props { onBack: () => void; initialTab?: string; }

const TermsPage: React.FC<Props> = ({ onBack, initialTab = '이용약관' }) => {
  const [tab, setTab] = useState(initialTab);
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>
        <span className={styles.title}>이용약관</span>
        <div style={{width:32}}/>
      </div>
      <div className={styles.tabs}>
        {TABS.map(t=><button key={t} className={`${styles.tab} ${tab===t?styles.tabActive:''}`} onClick={()=>setTab(t)}>{t}</button>)}
      </div>
      <div className={styles.termsSection}>
        <p className={styles.termsTitle}>제1조 (목적)</p>
        <p className={styles.termsText}>이 약관은 BAZAR(이하 "회사")가 제공하는 중고거래 및 경매 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.</p>
        <p className={styles.termsTitle} style={{marginTop:16}}>제2조 (정의)</p>
        <p className={styles.termsText}>"이용자"란 이 약관에 따라 회사가 제공하는 서비스를 받는 회원 및 비회원을 말합니다. "회원"이란 회사와 서비스 이용계약을 체결하고 이용자 아이디를 부여받은 자를 말합니다.</p>
        <p className={styles.termsTitle} style={{marginTop:16}}>제3조 (약관의 효력)</p>
        <p className={styles.termsText}>이 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력이 발생합니다. 회사는 약관의 규제에 관한 법률 등 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>
        <p className={styles.termsTitle} style={{marginTop:16}}>제4조 (서비스의 제공)</p>
        <p className={styles.termsText}>회사는 중고물품 거래 중개 서비스, 온라인 경매 서비스, 안전결제 서비스 등을 제공합니다. 서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 합니다.</p>
      </div>
    </div>
  );
};
export default TermsPage;
