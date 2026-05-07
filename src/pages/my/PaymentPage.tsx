import React, { useState } from 'react';
import styles from './MySubPage.module.css';

const TABS = ['결제 내역', '결제 수단'];
const PAYMENTS = [
  { id:1, name:'나이키 에어맥스 90 낙찰', date:'2026.04.20', amount:43000, status:'결제완료' },
  { id:2, name:'LG 27인치 4K 모니터', date:'2026.04.15', amount:280000, status:'결제완료' },
  { id:3, name:'PS5 디스크 에디션', date:'2026.04.10', amount:490000, status:'결제완료' },
];
const CARDS = [
  { id:1, name:'신한카드', number:'**** **** **** 1234', isDefault:true },
  { id:2, name:'국민카드', number:'**** **** **** 5678', isDefault:false },
];

interface Props { onBack: () => void; }

const PaymentPage: React.FC<Props> = ({ onBack }) => {
  const [tab, setTab] = useState('결제 내역');
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>
        <span className={styles.title}>결제 관리</span>
        <div style={{width:32}}/>
      </div>
      <div className={styles.tabs}>
        {TABS.map(t => <button key={t} className={`${styles.tab} ${tab===t?styles.tabActive:''}`} onClick={()=>setTab(t)}>{t}</button>)}
      </div>
      <div className={styles.list}>
        {tab === '결제 내역' ? PAYMENTS.map(p => (
          <div key={p.id} className={styles.payItem}>
            <div className={styles.payLeft}>
              <p className={styles.payName}>{p.name}</p>
              <p className={styles.payDate}>{p.date}</p>
            </div>
            <div className={styles.payRight}>
              <p className={styles.payAmount}>{p.amount.toLocaleString()}</p>
              <p className={styles.payStatus}>{p.status}</p>
            </div>
          </div>
        )) : (
          <>
            {CARDS.map(c => (
              <div key={c.id} className={styles.addrItem}>
                <div className={styles.addrHeader}>
                  <p className={styles.addrName}>💳 {c.name}</p>
                  {c.isDefault && <span className={styles.defaultBadge}>기본</span>}
                </div>
                <p className={styles.addrText}>{c.number}</p>
                <div className={styles.addrBtns}>
                  <button className={styles.addrBtn}>삭제</button>
                  {!c.isDefault && <button className={styles.addrBtn}>기본으로 설정</button>}
                </div>
              </div>
            ))}
            <button className={styles.addBtn}>+ 결제 수단 추가</button>
          </>
        )}
      </div>
    </div>
  );
};
export default PaymentPage;
