import React, { useState } from 'react';
import { type Member } from '../../data/memberData';
import { SANCTIONS } from '../../data/adminData';
import styles from './admin.module.css';

interface Props {
  member: Member;
  onBack: () => void;
  onUpdateStatus: (memberNo: string, status: Member['status'], suspendUntil?: string) => void;
}

const statusLabel = (s: Member['status']) => ({ active: '정상', suspended: '정지', permanent: '영구정지', withdrawn: '탈퇴' }[s]);
const statusColor = (s: Member['status']) => ({
  active: { background: '#D1E7DD', color: '#0F5132' },
  suspended: { background: '#F8D7DA', color: '#842029' },
  permanent: { background: '#1A1A1A', color: '#fff' },
  withdrawn: { background: '#E2E3E5', color: '#41464B' },
}[s]);
const tempColor = (t: number) => t >= 40 ? '#3B6D11' : t >= 35 ? '#EF9F27' : '#E24B4A';

const MemberDetailPage: React.FC<Props> = ({ member, onBack, onUpdateStatus }) => {
  const [activeTab, setActiveTab] = useState<'sanction'>('sanction');
  const [showSanctionModal, setShowSanctionModal] = useState(false);
  const [sanctionType, setSanctionType] = useState<Member['status']>('suspended');
  const [suspendUntil, setSuspendUntil] = useState('');
  const [sanctionReason, setSanctionReason] = useState('');

  const sanctions = SANCTIONS.filter(s => s.memberNo === member.memberNo);

  const handleSanction = () => {
    if (!sanctionReason) { alert('사유를 입력해주세요'); return; }
    onUpdateStatus(member.memberNo, sanctionType, suspendUntil || undefined);
    setShowSanctionModal(false);
  };

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className={styles.actionBtn} onClick={onBack}>← 목록으로</button>
        <h1 className={styles.title} style={{ margin: 0 }}>회원 상세</h1>
      </div>

      {/* 프로필 카드 */}
      <div style={{ background: '#fff', borderRadius: 14, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#F0F0F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>😊</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{member.name}</span>
            <span className={styles.badge} style={statusColor(member.status)}>{statusLabel(member.status)}</span>
            {member.sanctionCount > 0 && (
              <span className={`${styles.badge} ${styles.badgeHigh}`}>제재 {member.sanctionCount}회</span>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 24px' }}>
            {[
              ['회원번호', member.memberNo],
              ['이메일', member.email],
              ['휴대폰', member.phone],
              ['가입일', member.joinedAt],
              ['최근 로그인', member.lastLoginAt],
              ['정지 만료일', member.suspendUntil ?? '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <span style={{ fontSize: 11, color: '#8B8FA8', display: 'block' }}>{label}</span>
                <span style={{ fontSize: 13 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: tempColor(member.mannerTemp) }}>{member.mannerTemp}°</span>
          <span style={{ fontSize: 11, color: '#8B8FA8' }}>매너온도</span>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 12, textAlign: 'center' }}>
            <div><div style={{ fontWeight: 700, color: '#639922' }}>{member.salesCount}</div><div style={{ color: '#8B8FA8' }}>판매</div></div>
            <div><div style={{ fontWeight: 700, color: '#185FA5' }}>{member.purchaseCount}</div><div style={{ color: '#8B8FA8' }}>구매</div></div>
            <div><div style={{ fontWeight: 700, color: '#534AB7' }}>{member.bidCount}</div><div style={{ color: '#8B8FA8' }}>입찰</div></div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {member.status === 'active' && (
          <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => setShowSanctionModal(true)}>
            제재 적용
          </button>
        )}
        {(member.status === 'suspended' || member.status === 'permanent') && (
          <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => onUpdateStatus(member.memberNo, 'active')}>
            제재 해제
          </button>
        )}
      </div>

      {/* 제재 이력 탭 */}
      {activeTab === 'sanction' && (
        <table className={styles.table}>
          <thead>
            <tr><th>제재 종류</th><th>사유</th><th>관리자 메모</th><th>처리일</th><th>만료일</th></tr>
          </thead>
          <tbody>
            {sanctions.length === 0 && (
              <tr><td colSpan={5} className={styles.emptyText}>제재 이력이 없습니다</td></tr>
            )}
            {sanctions.map(s => (
              <tr key={s.id}>
                <td><span className={`${styles.badge} ${styles.badgeSuspend}`}>{{ warning:'경고', suspend_7:'7일 정지', suspend_30:'30일 정지', permanent:'영구 정지' }[s.type]}</span></td>
                <td style={{ fontSize: 12 }}>{s.reason}</td>
                <td style={{ fontSize: 12, color: '#8B8FA8' }}>{s.adminNote}</td>
                <td style={{ fontSize: 12, color: '#8B8FA8' }}>{s.createdAt}</td>
                <td style={{ fontSize: 12 }}>{s.expiresAt ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* 제재 적용 모달 */}
      {showSanctionModal && (
        <div className={styles.overlay} onClick={() => setShowSanctionModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{member.name} 제재 적용</h2>
              <button className={styles.modalClose} onClick={() => setShowSanctionModal(false)}>✕</button>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 6 }}>제재 종류</label>
              <select
                value={sanctionType}
                onChange={e => setSanctionType(e.target.value as Member['status'])}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', boxSizing: 'border-box' }}
              >
                <option value="suspended">기간 정지</option>
                <option value="permanent">영구 정지</option>
              </select>
            </div>
            {sanctionType === 'suspended' && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>정지 만료일</label>
                <input
                  type="date"
                  style={{ border: '1px solid #E0E0E0', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif', width: '100%', boxSizing: 'border-box' }}
                  value={suspendUntil}
                  onChange={e => setSuspendUntil(e.target.value)}
                />
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>사유</label>
              <textarea
                className={styles.textArea}
                placeholder="제재 사유를 입력하세요"
                value={sanctionReason}
                onChange={e => setSanctionReason(e.target.value)}
              />
            </div>
            <div className={styles.modalActions}>
              <button className={styles.actionBtn} onClick={() => setShowSanctionModal(false)}>취소</button>
              <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={handleSanction}>제재 적용</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetailPage;
