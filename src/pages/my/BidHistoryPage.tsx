import React, { useState } from 'react';
import { AUCTION_ITEMS } from '../../data/mockData';
import styles from './MySubPage.module.css';

const TABS = ['입찰중', '낙찰', '유찰'];
interface Props { onBack: () => void; }

const BidHistoryPage: React.FC<Props> = ({ onBack }) => {
  const [tab, setTab] = useState('입찰중');
  const items = tab === '입찰중' ? AUCTION_ITEMS.slice(0, 2) : tab === '낙찰' ? AUCTION_ITEMS.slice(2, 3) : [];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>
        <span className={styles.title}>입찰 내역</span>
        <div style={{width:32}}/>
      </div>
      <div className={styles.tabs}>
        {TABS.map(t => <button key={t} className={`${styles.tab} ${tab===t?styles.tabActive:''}`} onClick={()=>setTab(t)}>{t}</button>)}
      </div>
      <div className={styles.list}>
        {items.length > 0 ? items.map(item => (
          <div key={item.id} className={styles.tradeItem}>
            <img src={item.image} alt={item.name} className={styles.tradeImg}/>
            <div className={styles.tradeBody}>
              <p className={styles.tradeName}>{item.name}</p>
              <p className={styles.tradeMeta}>현재가 {item.currentPrice.toLocaleString()}</p>
              <p className={styles.tradePrice}>입찰 {item.bidCount}회 · ⏱ {item.timeLeft}</p>
            </div>
            <div className={styles.tradeActions}>
              <span className={`${styles.statusBadge} ${tab==='입찰중'?styles.statusBid:tab==='낙찰'?styles.statusOn:styles.statusDone}`}>
                {tab}
              </span>
            </div>
          </div>
        )) : (
          <div className={styles.empty}><p style={{fontSize:40}}>🔨</p><p className={styles.emptyText}>{tab} 내역이 없어요</p></div>
        )}
      </div>
    </div>
  );
};
export default BidHistoryPage;
