import React, { useState } from 'react';
import { REPORTS, type Report } from '../../data/adminData';
import styles from './admin.module.css';

type Filter = 'all' | 'pending' | 'product' | 'chat' | 'review';

const typeLabel = (t: Report['type']) => ({ product: '상품', chat: '채팅', review: '후기' }[t]);
const statusLabel = (s: Report['status']) => ({ pending: '처리대기', approved: '처리완료', rejected: '반려', deleted: '삭제완료' }[s]);
const statusClass = (s: Report['status']) => ({
  pending: styles.badgePending,
  approved: styles.badgeApproved,
  rejected: styles.badgeRejected,
  deleted: styles.badgeDeleted,
}[s]);

const ReportListPage: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Report | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [list, setList] = useState<Report[]>(REPORTS);

  const filtered = list.filter(r => {
    if (filter === 'pending') return r.status === 'pending';
    if (filter === 'product') return r.type === 'product';
    if (filter === 'chat') return r.type === 'chat';
    if (filter === 'review') return r.type === 'review';
    return true;
  });

  const pending = list.filter(r => r.status === 'pending').length;
  const products = list.filter(r => r.type === 'product').length;
  const chats = list.filter(r => r.type === 'chat').length;
  const reviews = list.filter(r => r.type === 'review').length;

  const handleAction = (id: number, action: Report['status']) => {
    setList(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
    setSelected(null);
  };

  const openDetail = (r: Report) => {
    setSelected(r);
    setAdminNote('');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>신고 접수 현황</h1>
        <p className={styles.subtitle}>접수된 신고를 검토하고 처리합니다</p>
      </div>

      {/* 통계 */}
      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumRed}`}>{pending}</div>
          <div className={styles.statLabel}>미처리</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{products}</div>
          <div className={styles.statLabel}>상품 신고</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{chats}</div>
          <div className={styles.statLabel}>채팅 신고</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{reviews}</div>
          <div className={styles.statLabel}>후기 신고</div>
        </div>
      </div>

      {/* 필터 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as Filter)}
          style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 130 }}
        >
          <option value="all">전체</option>
          <option value="pending">미처리 {pending}</option>
          <option value="product">상품</option>
          <option value="chat">채팅</option>
          <option value="review">후기</option>
        </select>
      </div>

      {/* 테이블 */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>유형</th>
            <th>신고 대상</th>
            <th>신고자</th>
            <th>피신고자</th>
            <th>사유</th>
            <th>접수일시</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr><td colSpan={9} className={styles.emptyText}>신고 내역이 없습니다</td></tr>
          )}
          {filtered.map(r => (
            <tr key={r.id}>
              <td style={{ color: '#8B8FA8', fontSize: 12 }}>#{r.id}</td>
              <td><span className={styles.badge} style={{ background: '#EEF', color: '#534AB7', fontSize: 11 }}>{typeLabel(r.type)}</span></td>
              <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.targetName}</td>
              <td>
                <div style={{ fontSize: 12 }}>{r.reporterName}</div>
                <div style={{ fontSize: 11, color: '#8B8FA8' }}>{r.reporterNo}</div>
              </td>
              <td>
                <div style={{ fontSize: 12 }}>{r.targetUserName}</div>
                <div style={{ fontSize: 11, color: '#8B8FA8' }}>{r.targetUserNo}</div>
              </td>
              <td style={{ fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.reason}</td>
              <td style={{ fontSize: 12, color: '#8B8FA8', whiteSpace: 'nowrap' }}>{r.createdAt}</td>
              <td><span className={`${styles.badge} ${statusClass(r.status)}`}>{statusLabel(r.status)}</span></td>
              <td>
                <button className={styles.actionBtn} onClick={() => openDetail(r)}>상세</button>
                {r.status === 'pending' && (
                  <>
                    <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleAction(r.id, 'deleted')}>삭제</button>
                    <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => handleAction(r.id, 'approved')}>승인</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 상세 모달 */}
      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>신고 상세 #{selected.id}</h2>
              <button className={styles.modalClose} onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>신고 유형</span>
              <span className={styles.infoValue}>{typeLabel(selected.type)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>신고 대상</span>
              <span className={styles.infoValue}>{selected.targetName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>신고자</span>
              <span className={styles.infoValue}>{selected.reporterName} ({selected.reporterNo})</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>피신고자</span>
              <span className={styles.infoValue}>{selected.targetUserName} ({selected.targetUserNo})</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>신고 사유</span>
              <span className={styles.infoValue}>{selected.reason}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>상세 내용</span>
              <span className={styles.infoValue}>{selected.detail}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>접수일시</span>
              <span className={styles.infoValue}>{selected.createdAt}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>처리 상태</span>
              <span className={`${styles.badge} ${statusClass(selected.status)}`}>{statusLabel(selected.status)}</span>
            </div>

            {selected.status === 'pending' && (
              <>
                <div className={styles.divider} />
                <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>처리 메모</p>
                <textarea
                  className={styles.textArea}
                  placeholder="처리 내용을 입력하세요 (선택)"
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                />
                <div className={styles.modalActions}>
                  <button className={styles.actionBtn} onClick={() => handleAction(selected.id, 'rejected')}>반려</button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleAction(selected.id, 'deleted')}>상품/후기 삭제</button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => handleAction(selected.id, 'approved')}>처리 완료</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportListPage;
