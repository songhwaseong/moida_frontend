import React, { useState } from 'react';
import { PRODUCTS } from '../../data/mockData';
import styles from './MySubPage.module.css';

const TABS = ['판매중', '거래완료', '숨김'];
interface Props { onBack: () => void; }

const SalesHistoryPage: React.FC<Props> = ({ onBack }) => {
  const [tab, setTab] = useState('판매중');
  const items = tab === '판매중' ? PRODUCTS.slice(0, 2) : tab === '거래완료' ? PRODUCTS.slice(2) : [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>
        <span className={styles.title}>판매 내역</span>
        <div style={{width:32}}/>
      </div>
      <div className={styles.tabs}>
        {TABS.map(t => <button key={t} className={`${styles.tab} ${tab===t?styles.tabActive:''}`} onClick={()=>setTab(t)}>{t}</button>)}
      </div>
      <div className={styles.list}>
        {items.length > 0 ? items.map(p => (
          <div key={p.id} className={styles.tradeItem}>
            <img src={p.image} alt={p.name} className={styles.tradeImg}/>
            <div className={styles.tradeBody}>
              <p className={styles.tradeName}>{p.name}</p>
              <p className={styles.tradeMeta}>{p.location} · {p.timeAgo}</p>
              <p className={styles.tradePrice}> {p.price.toLocaleString()}</p>
            </div>
            <div className={styles.tradeActions}>
              <span className={`${styles.statusBadge} ${tab==='판매중'?styles.statusOn:styles.statusDone}`}>{tab==='판매중'?'판매중':'완료'}</span>
              {tab==='거래완료' && <button className={styles.reviewBtn}>후기 작성</button>}
            </div>
          </div>
        )) : (
          <div className={styles.empty}><p style={{fontSize:40}}>📦</p><p className={styles.emptyText}>{tab} 상품이 없어요</p></div>
        )}
      </div>
    </div>
  );
};
export default SalesHistoryPage;
