import React, { useState } from 'react';
import { CHAT_LOGS, type ChatLog } from '../../data/adminData';
import styles from './admin.module.css';

const ChatLogPage: React.FC = () => {
  const [selected, setSelected] = useState<ChatLog | null>(null);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>채팅 로그 조회</h1>
        <p className={styles.subtitle}>신고된 채팅방의 대화 내역을 열람합니다</p>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>로그 ID</th>
            <th>신고 ID</th>
            <th>채팅방</th>
            <th>참여자</th>
            <th>신고 사유</th>
            <th>메시지 수</th>
            <th>열람</th>
          </tr>
        </thead>
        <tbody>
          {CHAT_LOGS.map(log => (
            <tr key={log.id}>
              <td style={{ color: '#8B8FA8', fontSize: 12 }}>#{log.id}</td>
              <td style={{ fontSize: 12 }}>신고 #{log.reportId}</td>
              <td style={{ fontSize: 13 }}>채팅방 #{log.roomId}</td>
              <td>
                {log.participants.map((p, i) => (
                  <div key={i} style={{ fontSize: 12, color: '#555' }}>{p}</div>
                ))}
              </td>
              <td>
                <span className={styles.badge} style={{ background: '#FCEBEB', color: '#A32D2D', fontSize: 11 }}>
                  {log.reportReason}
                </span>
              </td>
              <td style={{ fontSize: 13 }}>{log.messages.length}건</td>
              <td>
                <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => setSelected(log)}>
                  로그 열람
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>채팅방 #{selected.roomId} 로그</h2>
              <button className={styles.modalClose} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {selected.participants.map((p, i) => (
                <span key={i} className={styles.badge} style={{ background: '#EEF', color: '#534AB7', fontSize: 11 }}>{p}</span>
              ))}
              <span className={styles.badge} style={{ background: '#FCEBEB', color: '#A32D2D', fontSize: 11 }}>신고: {selected.reportReason}</span>
            </div>

            <div className={styles.divider} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 380, overflowY: 'auto' }}>
              {selected.messages.map((msg, i) => {
                const isFirst = selected.participants[0].startsWith(msg.sender);
                return (
                  <div key={i} style={{ display: 'flex', flexDirection: isFirst ? 'row' : 'row-reverse', gap: 8, alignItems: 'flex-end' }}>
                    <div style={{
                      background: isFirst ? '#F0F0F0' : '#E24B4A',
                      color: isFirst ? '#1A1A1A' : '#fff',
                      padding: '8px 12px',
                      borderRadius: isFirst ? '4px 12px 12px 12px' : '12px 4px 12px 12px',
                      fontSize: 13,
                      maxWidth: '70%',
                      lineHeight: 1.5,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3, opacity: 0.7 }}>{msg.sender}</div>
                      {msg.text}
                    </div>
                    <div style={{ fontSize: 11, color: '#8B8FA8', whiteSpace: 'nowrap', marginBottom: 2 }}>{msg.time}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLogPage;
