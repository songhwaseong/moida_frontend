import React, { useState } from 'react';
import { SANCTIONS, type Sanction } from '../../data/adminData';
import styles from './admin.module.css';

const typeLabel = (t: Sanction['type']) => ({
  warning: '경고', suspend_7: '7일 정지', suspend_30: '30일 정지', permanent: '영구 정지',
}[t]);

const typeClass = (t: Sanction['type']) => ({
  warning: styles.badgeWarning,
  suspend_7: styles.badgeSuspend,
  suspend_30: styles.badgeSuspend,
  permanent: styles.badgePermanent,
}[t]);

const SANCTION_TYPES: { value: Sanction['type']; label: string }[] = [
  { value: 'warning', label: '경고' },
  { value: 'suspend_7', label: '7일 정지' },
  { value: 'suspend_30', label: '30일 정지' },
  { value: 'permanent', label: '영구 정지' },
];

const PAGE_SIZE = 5;

const SanctionPage: React.FC = () => {
  const [list, setList] = useState<Sanction[]>(SANCTIONS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ memberNo: '', memberName: '', type: 'warning' as Sanction['type'], reason: '', adminNote: '' });
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(list.length / PAGE_SIZE);
  const paged = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAdd = () => {
    if (!form.memberNo || !form.reason) { alert('회원번호와 사유를 입력해주세요'); return; }
    const now = new Date();
    const fmt = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const newSanction: Sanction = {
      id: Date.now(), ...form,
      createdAt: fmt,
      expiresAt: form.type === 'suspend_7' ? '7일 후' : form.type === 'suspend_30' ? '30일 후' : undefined,
    };
    setList(prev => [newSanction, ...prev]);
    setShowAdd(false);
    setForm({ memberNo: '', memberName: '', type: 'warning', reason: '', adminNote: '' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.header} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className={styles.title}>제재 내역</h1>
          <p className={styles.subtitle}>회원 제재 이력을 관리합니다</p>
        </div>
        <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => setShowAdd(true)}>
          + 제재 추가
        </button>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <div className={styles.statNum}>{list.length}</div>
          <div className={styles.statLabel}>전체 제재</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumAmber}`}>{list.filter(s => s.type === 'warning').length}</div>
          <div className={styles.statLabel}>경고</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumRed}`}>{list.filter(s => s.type.startsWith('suspend')).length}</div>
          <div className={styles.statLabel}>정지</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNum} style={{ color: '#1A1A1A' }}>{list.filter(s => s.type === 'permanent').length}</div>
          <div className={styles.statLabel}>영구 정지</div>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>회원번호</th>
            <th>이름</th>
            <th>제재 종류</th>
            <th>사유</th>
            <th>관리자 메모</th>
            <th>처리 일시</th>
            <th>만료일</th>
          </tr>
        </thead>
        <tbody>
          {paged.map(s => (
            <tr key={s.id}>
              <td style={{ fontSize: 12 }}>{s.memberNo}</td>
              <td style={{ fontWeight: 500 }}>{s.memberName}</td>
              <td><span className={`${styles.badge} ${typeClass(s.type)}`}>{typeLabel(s.type)}</span></td>
              <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.reason}</td>
              <td style={{ fontSize: 12, color: '#8B8FA8', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.adminNote}</td>
              <td style={{ fontSize: 12, color: '#8B8FA8', whiteSpace: 'nowrap' }}>{s.createdAt}</td>
              <td style={{ fontSize: 12, color: s.expiresAt ? '#E24B4A' : '#8B8FA8' }}>{s.expiresAt ?? '—'}</td>
            </tr>
          ))}
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

      {/* 제재 추가 모달 */}
      {showAdd && (
        <div className={styles.overlay} onClick={() => setShowAdd(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>제재 추가</h2>
              <button className={styles.modalClose} onClick={() => setShowAdd(false)}>✕</button>
            </div>
            {[
              { label: '회원번호', key: 'memberNo', placeholder: '예: 2024031500001' },
              { label: '이름', key: 'memberName', placeholder: '회원 이름' },
              { label: '사유', key: 'reason', placeholder: '제재 사유' },
              { label: '관리자 메모', key: 'adminNote', placeholder: '내부 메모 (선택)' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input
                  style={{ width: '100%', border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif', boxSizing: 'border-box' }}
                  placeholder={f.placeholder}
                  value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>제재 종류</label>
              <select
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value as typeof form.type }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              >
                {SANCTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.actionBtn} onClick={() => setShowAdd(false)}>취소</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={handleAdd}>제재 적용</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SanctionPage;
