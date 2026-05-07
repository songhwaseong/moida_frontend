import React, { useState } from 'react';
import { MEMBERS } from '../../data/memberData';
import styles from './admin.module.css';

const PAGE_SIZE = 5;

const WithdrawnMemberPage: React.FC = () => {
  const withdrawn = MEMBERS.filter(m => m.status === 'withdrawn');
  const [selected, setSelected] = useState<typeof withdrawn[0] | null>(null);
  const [purgeConfirm, setPurgeConfirm] = useState(false);
  const [purged, setPurged] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(withdrawn.length / PAGE_SIZE);
  const paged = withdrawn.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePurge = (memberNo: string) => {
    setPurged(prev => new Set([...prev, memberNo]));
    setPurgeConfirm(false);
    setSelected(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>탈퇴 회원 관리</h1>
        <p className={styles.subtitle}>탈퇴 처리된 회원의 개인정보 파기를 관리합니다</p>
      </div>

      <div style={{ background: '#FAEEDA', border: '1px solid #EF9F27', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#854F0B' }}>
        ⚠️ 개인정보 파기는 되돌릴 수 없습니다. 법적 보존 기간(탈퇴 후 5년)이 지난 회원의 정보만 파기하세요.
      </div>

      <div className={styles.statRow} style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{withdrawn.length}</div>
          <div className={styles.statLabel}>탈퇴 회원 수</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumAmber}`}>{purged.size}</div>
          <div className={styles.statLabel}>파기 완료</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumRed}`}>{withdrawn.length - purged.size}</div>
          <div className={styles.statLabel}>파기 대기</div>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>회원번호</th>
            <th>이름</th>
            <th>이메일</th>
            <th>가입일</th>
            <th>신고 이력</th>
            <th>개인정보</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {withdrawn.length === 0 && (
            <tr><td colSpan={7} className={styles.emptyText}>탈퇴 회원이 없습니다</td></tr>
          )}
          {paged.map(m => {
            const isPurged = purged.has(m.memberNo);
            return (
              <tr key={m.memberNo}>
                <td style={{ fontSize: 11, color: '#8B8FA8', fontFamily: 'monospace' }}>{m.memberNo}</td>
                <td style={{ fontWeight: 500, color: isPurged ? '#ccc' : '#1A1A1A' }}>
                  {isPurged ? '(파기됨)' : m.name}
                </td>
                <td style={{ fontSize: 12, color: isPurged ? '#ccc' : '#555' }}>
                  {isPurged ? '(파기됨)' : m.email}
                </td>
                <td style={{ fontSize: 12, color: '#8B8FA8' }}>{m.joinedAt}</td>
                <td>
                  {m.reportCount > 0
                    ? <span className={`${styles.badge} ${styles.badgeHigh}`}>{m.reportCount}건</span>
                    : <span style={{ fontSize: 12, color: '#ccc' }}>없음</span>
                  }
                </td>
                <td>
                  {isPurged
                    ? <span className={`${styles.badge} ${styles.badgeApproved}`}>파기 완료</span>
                    : <span className={`${styles.badge} ${styles.badgePending}`}>보존 중</span>
                  }
                </td>
                <td>
                  {!isPurged && (
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => { setSelected(m); setPurgeConfirm(true); }}
                    >개인정보 파기</button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: page === 1 ? '#F5F5F5' : '#fff', color: page === 1 ? '#ccc' : '#4A4A6A', cursor: page === 1 ? 'default' : 'pointer', fontSize: 13 }}>이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: page === n ? '#E24B4A' : '#fff', color: page === n ? '#fff' : '#4A4A6A', fontWeight: page === n ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: page === totalPages ? '#F5F5F5' : '#fff', color: page === totalPages ? '#ccc' : '#4A4A6A', cursor: page === totalPages ? 'default' : 'pointer', fontSize: 13 }}>다음</button>
        </div>
      )}

      {purgeConfirm && selected && (
        <div className={styles.overlay} onClick={() => { setPurgeConfirm(false); setSelected(null); }}>
          <div className={styles.modal} style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>개인정보 파기 확인</h2>
              <button className={styles.modalClose} onClick={() => { setPurgeConfirm(false); setSelected(null); }}>✕</button>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16, color: '#555' }}>
              <strong>{selected.name}</strong> ({selected.memberNo}) 회원의 개인정보를 파기합니다.<br/>
              이 작업은 <strong style={{ color: '#E24B4A' }}>되돌릴 수 없습니다.</strong>
            </p>
            <div className={styles.modalActions}>
              <button className={styles.actionBtn} onClick={() => { setPurgeConfirm(false); setSelected(null); }}>취소</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handlePurge(selected.memberNo)}>파기 확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawnMemberPage;
