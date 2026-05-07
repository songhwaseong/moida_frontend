import React, { useState } from 'react';
import styles from './NotificationPage.module.css';

interface Noti {
  id: number;
  type: 'auction' | 'chat' | 'price' | 'system';
  emoji: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
}

const NOTIFICATIONS: Noti[] = [
  { id: 1, type: 'auction', emoji: '🔨', title: '입찰 경쟁 알림', body: '나이키 에어맥스 90에 새로운 입찰이 들어왔어요. 현재 45,000', time: '2분 전', read: false },
  { id: 2, type: 'chat', emoji: '💬', title: '새 메시지', body: '구매자: 직거래 가능한가요? 강남역 근처면 좋겠어요', time: '15분 전', read: false },
  { id: 3, type: 'price', emoji: '📉', title: '관심상품 가격 인하', body: 'LG 27인치 4K 모니터 280,000 → 240,000으로 내렸어요', time: '1시간 전', read: false },
  { id: 4, type: 'auction', emoji: '⏰', title: '경매 마감 임박', body: '관심 등록한 소니 A7IV 카메라 경매가 30분 후 종료돼요', time: '2시간 전', read: true },
  { id: 5, type: 'system', emoji: '🎉', title: '거래 완료', body: 'PS5 거래가 완료됐어요. 후기를 남겨주세요!', time: '어제', read: true },
  { id: 6, type: 'chat', emoji: '💬', title: '새 메시지', body: '판매자: 네, 오늘 오후 6시에 만날 수 있어요', time: '어제', read: true },
  { id: 7, type: 'system', emoji: '✅', title: '인증 완료', body: '계좌 인증이 완료됐어요. 이제 판매를 시작할 수 있어요', time: '3일 전', read: true },
];

const TYPE_COLOR: Record<Noti['type'], string> = {
  auction: '#FDEEED',
  chat: '#E1F5EE',
  price: '#EAF3DE',
  system: '#F0F1F4',
};

const NotificationPage: React.FC = () => {
  const [notis, setNotis] = useState(NOTIFICATIONS);
  const unreadCount = notis.filter((n) => !n.read).length;

  const markAll = () => setNotis((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOne = (id: number) => setNotis((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>알림 {unreadCount > 0 && <span className={styles.badge}>{unreadCount}</span>}</h1>
        {unreadCount > 0 && (
          <button className={styles.markAll} onClick={markAll}>모두 읽음</button>
        )}
      </div>

      <div className={styles.list}>
        {notis.map((n) => (
          <div
            key={n.id}
            className={`${styles.item} ${!n.read ? styles.unread : ''}`}
            onClick={() => markOne(n.id)}
          >
            <div className={styles.iconBox} style={{ background: TYPE_COLOR[n.type] }}>
              <span>{n.emoji}</span>
            </div>
            <div className={styles.content}>
              <div className={styles.itemHeader}>
                <span className={styles.itemTitle}>{n.title}</span>
                <span className={styles.time}>{n.time}</span>
              </div>
              <p className={styles.body}>{n.body}</p>
            </div>
            {!n.read && <div className={styles.dot} />}
          </div>
        ))}
      </div>
    </main>
  );
};

export default NotificationPage;
