import React, { useState } from 'react';
import styles from './ChatPage.module.css';

interface ChatRoom {
  id: number;
  productEmoji: string;
  productName: string;
  otherUser: string;
  lastMessage: string;
  time: string;
  unread: number;
  price: number;
}

const CHAT_ROOMS: ChatRoom[] = [
  { id: 1, productEmoji: '👟', productName: '나이키 에어맥스 90', otherUser: '운동화마니아', lastMessage: '직거래 가능한가요? 강남역 근처면 좋겠어요', time: '방금', unread: 2, price: 43000 },
  { id: 2, productEmoji: '💻', productName: '맥북 프로 M2', otherUser: '코딩러버', lastMessage: '네, 오늘 오후 6시에 만날 수 있어요', time: '10분 전', unread: 0, price: 980000 },
  { id: 3, productEmoji: '👜', productName: '샤넬 클래식 플랩백', otherUser: '명품셀러', lastMessage: '정품 보증서도 같이 드려요!', time: '1시간 전', unread: 1, price: 8500000 },
  { id: 4, productEmoji: '🎮', productName: 'PS5 디스크 에디션', otherUser: '게임왕', lastMessage: '거래 완료 감사합니다 ☺️', time: '어제', unread: 0, price: 490000 },
  { id: 5, productEmoji: '🖥️', productName: 'LG 27인치 4K 모니터', otherUser: '홈오피스족', lastMessage: '혹시 택배 가능하신가요?', time: '2일 전', unread: 0, price: 280000 },
];

interface Message {
  id: number;
  text: string;
  mine: boolean;
  time: string;
}

const MESSAGES: Message[] = [
  { id: 1, text: '안녕하세요! 직거래 가능한가요?', mine: false, time: '오후 2:10' },
  { id: 2, text: '네 가능합니다! 어느 지역이세요?', mine: true, time: '오후 2:11' },
  { id: 3, text: '강남역 근처면 좋겠어요 😊', mine: false, time: '오후 2:12' },
  { id: 4, text: '저도 강남 근처라 딱 좋네요. 언제 시간 되세요?', mine: true, time: '오후 2:13' },
  { id: 5, text: '직거래 가능한가요? 강남역 근처면 좋겠어요', mine: false, time: '오후 2:30' },
];

const ChatPage: React.FC = () => {
  const [selected, setSelected] = useState<ChatRoom | null>(null);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(MESSAGES);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), text: input, mine: true, time: '지금' }]);
    setInput('');
  };

  if (selected) {
    return (
      <main className={styles.chatMain}>
        <div className={styles.chatHeader}>
          <button className={styles.back} onClick={() => setSelected(null)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className={styles.chatHeaderInfo}>
            <p className={styles.chatHeaderName}>{selected.otherUser}</p>
            <p className={styles.chatHeaderProduct}>{selected.productEmoji} {selected.productName}</p>
          </div>
        </div>

        <div className={styles.productBar}>
          <span className={styles.productBarEmoji}>{selected.productEmoji}</span>
          <div>
            <p className={styles.productBarName}>{selected.productName}</p>
            <p className={styles.productBarPrice}> {selected.price.toLocaleString()}</p>
          </div>
          <button className={styles.tradeBtn}>거래 확정</button>
        </div>

        <div className={styles.messages}>
          {messages.map((m) => (
            <div key={m.id} className={`${styles.bubble} ${m.mine ? styles.mine : styles.theirs}`}>
              <p className={styles.bubbleText}>{m.text}</p>
              <span className={styles.bubbleTime}>{m.time}</span>
            </div>
          ))}
        </div>

        <div className={styles.inputBar}>
          <button className={styles.attach}>
            <svg width="22" height="22" fill="none" stroke="var(--muted)" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>
          <input
            className={styles.msgInput}
            placeholder="메시지를 입력하세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button className={styles.sendBtn} onClick={sendMessage} disabled={!input.trim()}>
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1 className={styles.title}>채팅</h1>
      </div>
      <div className={styles.list}>
        {CHAT_ROOMS.map((room) => (
          <div key={room.id} className={styles.room} onClick={() => setSelected(room)}>
            <div className={styles.roomEmoji}>{room.productEmoji}</div>
            <div className={styles.roomContent}>
              <div className={styles.roomTop}>
                <span className={styles.roomUser}>{room.otherUser}</span>
                <span className={styles.roomTime}>{room.time}</span>
              </div>
              <div className={styles.roomBottom}>
                <span className={styles.roomMsg}>{room.lastMessage}</span>
                {room.unread > 0 && <span className={styles.unreadBadge}>{room.unread}</span>}
              </div>
              <p className={styles.roomProduct}>{room.productEmoji} {room.productName} · {room.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default ChatPage;
