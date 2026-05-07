import React, { useState } from 'react';
import styles from './MySubPage.module.css';

const SETTINGS = [
  { key:'bid', emoji:'🔨', label:'입찰 알림', desc:'내 경매에 새 입찰이 생기면 알려드려요' },
  { key:'price', emoji:'📉', label:'가격 인하 알림', desc:'관심 상품 가격이 내려가면 알려드려요' },
  { key:'chat', emoji:'💬', label:'채팅 알림', desc:'새 메시지가 오면 알려드려요' },
  { key:'trade', emoji:'✅', label:'거래 완료 알림', desc:'거래가 완료되면 알려드려요' },
  { key:'marketing', emoji:'📢', label:'마케팅 알림', desc:'이벤트, 혜택 정보를 알려드려요' },
];

interface Props { onBack: () => void; }

const NotificationSettingsPage: React.FC<Props> = ({ onBack }) => {
  const [enabled, setEnabled] = useState<Record<string,boolean>>({bid:true,price:true,chat:true,trade:true,marketing:false});
  const toggle = (key:string) => setEnabled(p=>({...p,[key]:!p[key]}));

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>
        <span className={styles.title}>알림 설정</span>
        <div style={{width:32}}/>
      </div>
      <div>
        {SETTINGS.map(s => (
          <div key={s.key} className={styles.settingItem}>
            <div className={styles.settingLeft}>
              <span className={styles.settingEmoji}>{s.emoji}</span>
              <div>
                <p className={styles.settingLabel}>{s.label}</p>
                <p className={styles.settingDesc}>{s.desc}</p>
              </div>
            </div>
            <button
              className={`${styles.toggle} ${enabled[s.key]?styles.toggleOn:styles.toggleOff}`}
              onClick={()=>toggle(s.key)}
            >
              <div className={`${styles.toggleDot} ${enabled[s.key]?styles.toggleDotOn:styles.toggleDotOff}`}/>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
export default NotificationSettingsPage;
