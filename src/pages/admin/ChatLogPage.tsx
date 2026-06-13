import React, { useCallback, useEffect, useState } from 'react';
import { getProductChatMessages, type ProductChatMessage, type ProductChatRoomStatus } from '../../api/chat';
import {
  getAdminChatRooms,
  hideAdminChatMessage,
  updateAdminChatRoomStatus,
  type AdminChatRoom,
} from '../../api/adminChat';
import styles from './admin.module.css';
import { useRegisterAdminRefresh } from './AdminRefreshContext';

const STATUS_LABEL: Record<ProductChatRoomStatus, string> = {
  ACTIVE: '활성',
  READ_ONLY: '읽기 전용',
  HIDDEN: '숨김',
};

const ChatLogPage: React.FC = () => {
  const [rooms, setRooms] = useState<AdminChatRoom[]>([]);
  const [selected, setSelected] = useState<AdminChatRoom | null>(null);
  const [messages, setMessages] = useState<ProductChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // 관리자 목록은 채팅방별 상태, 최근 메시지, 메시지 수를 한 줄로 보여준다.
  const loadRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminChatRooms();
      setRooms(data);
      setError('');
    } catch (loadError) {
      console.error('Failed to load admin chat rooms', loadError);
      setError('채팅방 목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => {
      void loadRooms();
    }, 0);

    return () => window.clearTimeout(initialTimer);
  }, [loadRooms]);

  useRegisterAdminRefresh(loadRooms, isLoading);

  // 채팅방 상세 모달은 같은 상품 채팅 API를 사용하되,
  // 관리자가 흐름을 볼 수 있도록 더 많은 메시지를 요청한다.
  const openRoom = async (room: AdminChatRoom) => {
    setSelected(room);
    try {
      const data = await getProductChatMessages(room.productId, 100);
      setMessages(data.messages);
      setError('');
    } catch (loadError) {
      console.error('Failed to load admin chat messages', loadError);
      setMessages([]);
      setError('채팅 메시지를 불러오지 못했습니다.');
    }
  };

  // ACTIVE는 일반 채팅 가능, READ_ONLY는 이력만 표시,
  // HIDDEN은 사용자 화면에서 사실상 숨김 처리한다.
  const changeStatus = async (room: AdminChatRoom, status: ProductChatRoomStatus) => {
    try {
      const updated = await updateAdminChatRoomStatus(room.id, status);
      setRooms(prev => prev.map(item => item.id === updated.id ? updated : item));
      setSelected(prev => prev && prev.id === updated.id ? updated : prev);
    } catch (statusError) {
      console.error('Failed to update chat room status', statusError);
      setError('채팅방 상태 변경에 실패했습니다.');
    }
  };

  // 메시지는 실제 삭제가 아니라 숨김 처리해서 감사 이력은 DB에 남긴다.
  const hideMessage = async (messageId: number) => {
    try {
      const updated = await hideAdminChatMessage(messageId);
      setMessages(prev => prev.map(message => message.id === updated.id ? updated : message));
    } catch (hideError) {
      console.error('Failed to hide chat message', hideError);
      setError('메시지 삭제 처리에 실패했습니다.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>채팅 관리</h1>
        <p className={styles.subtitle}>상품/경매 상세의 공개 채팅방 상태와 메시지를 관리합니다.</p>
      </div>

      {error && <p style={{ color: '#D33A32', fontSize: 13, fontWeight: 700 }}>{error}</p>}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>방 ID</th>
            <th>상품</th>
            <th>상태</th>
            <th>최근 메시지</th>
            <th>메시지 수</th>
            <th>수정일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: '#8B8FA8', padding: 24 }}>불러오는 중입니다.</td>
            </tr>
          ) : rooms.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ textAlign: 'center', color: '#8B8FA8', padding: 24 }}>생성된 채팅방이 없습니다.</td>
            </tr>
          ) : rooms.map(room => (
            <tr key={room.id}>
              <td style={{ color: '#8B8FA8', fontSize: 12 }}>#{room.id}</td>
              <td style={{ fontSize: 13 }}>{room.productName}</td>
              <td>
                <select
                  value={room.status}
                  onChange={event => void changeStatus(room, event.target.value as ProductChatRoomStatus)}
                  style={{ height: 32, border: '1px solid #E8E8EF', borderRadius: 8, padding: '0 8px' }}
                >
                  <option value="ACTIVE">활성</option>
                  <option value="READ_ONLY">읽기 전용</option>
                  <option value="HIDDEN">숨김</option>
                </select>
              </td>
              <td style={{ fontSize: 13, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {room.lastMessage || '-'}
              </td>
              <td style={{ fontSize: 13 }}>{room.messageCount}건</td>
              <td style={{ fontSize: 12, color: '#8B8FA8' }}>{room.updatedAt}</td>
              <td>
                <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => void openRoom(room)}>
                  메시지 보기
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} style={{ maxWidth: 680 }} onClick={event => event.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>채팅방 #{selected.id}</h2>
              <button className={styles.modalClose} onClick={() => setSelected(null)}>×</button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
              <span className={styles.badge} style={{ background: '#EEF', color: '#534AB7', fontSize: 11 }}>
                {selected.productName}
              </span>
              <span className={styles.badge} style={{ background: '#FCEBEB', color: '#A32D2D', fontSize: 11 }}>
                {STATUS_LABEL[selected.status]}
              </span>
            </div>

            <div className={styles.divider} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#8B8FA8', fontSize: 13, padding: 24 }}>메시지가 없습니다.</p>
              ) : messages.map(message => (
                <div key={message.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div style={{
                    background: message.deleted ? '#F0F0F0' : message.mine ? '#E24B4A' : '#F0F0F0',
                    color: message.deleted ? '#8B8FA8' : message.mine ? '#fff' : '#1A1A1A',
                    padding: '8px 12px',
                    borderRadius: 12,
                    fontSize: 13,
                    maxWidth: '72%',
                    lineHeight: 1.5,
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 3, opacity: 0.75 }}>
                      {message.senderName}{message.seller ? ' · 판매자' : ''}
                    </div>
                    {message.content}
                  </div>
                  <div style={{ fontSize: 11, color: '#8B8FA8', whiteSpace: 'nowrap', marginBottom: 2 }}>{message.createdAt}</div>
                  {!message.deleted && (
                    <button
                      className={styles.actionBtn}
                      onClick={() => void hideMessage(message.id)}
                      style={{ marginBottom: 0 }}
                    >
                      삭제
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatLogPage;
