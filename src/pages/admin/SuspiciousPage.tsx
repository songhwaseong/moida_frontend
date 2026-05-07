import React, { useState } from 'react';
import { SUSPICIOUS_CASES, type SuspiciousCase } from '../../data/adminData';
import styles from './admin.module.css';

const caseTypeLabel = (t: SuspiciousCase['caseType']) => ({
  bid_manipulation: '입찰 조작',
  duplicate_account: '중복 계정',
  fake_review: '허위 후기',
  fraud: '사기 의심',
}[t]);

const statusClass = (s: SuspiciousCase['status']) => ({
  open: styles.badgeOpen,
  investigating: styles.badgeInvestigating,
  resolved: styles.badgeResolved,
}[s]);

const statusLabel = (s: SuspiciousCase['status']) => ({
  open: '신규', investigating: '조사중', resolved: '해결',
}[s]);

const severityClass = (s: SuspiciousCase['severity']) => ({
  high: styles.badgeHigh, medium: styles.badgeMedium, low: styles.badgeLow,
}[s]);

const SuspiciousPage: React.FC = () => {
  const [list, setList] = useState<SuspiciousCase[]>(SUSPICIOUS_CASES);
  const [selected, setSelected] = useState<SuspiciousCase | null>(null);

  const updateStatus = (id: number, status: SuspiciousCase['status']) => {
    setList(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setSelected(null);
  };

  const high = list.filter(c => c.severity === 'high' && c.status !== 'resolved').length;
  const open = list.filter(c => c.status === 'open').length;
  const investigating = list.filter(c => c.status === 'investigating').length;
  const resolved = list.filter(c => c.status === 'resolved').length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>사기 의심 감지</h1>
        <p className={styles.subtitle}>비정상 행동 패턴이 감지된 케이스를 조사합니다</p>
      </div>

      <div className={styles.statRow}>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumRed}`}>{high}</div>
          <div className={styles.statLabel}>고위험 미처리</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumRed}`}>{open}</div>
          <div className={styles.statLabel}>신규</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumAmber}`}>{investigating}</div>
          <div className={styles.statLabel}>조사중</div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statNum} ${styles.statNumGreen}`}>{resolved}</div>
          <div className={styles.statLabel}>해결</div>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>회원번호</th>
            <th>이름</th>
            <th>감지 유형</th>
            <th>위험도</th>
            <th>상세 내용</th>
            <th>감지 일시</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {list.map(c => (
            <tr key={c.id}>
              <td style={{ color: '#8B8FA8', fontSize: 12 }}>#{c.id}</td>
              <td style={{ fontSize: 12 }}>{c.memberNo}</td>
              <td style={{ fontSize: 13, fontWeight: 500 }}>{c.memberName}</td>
              <td><span className={styles.badge} style={{ background: '#EEF', color: '#534AB7', fontSize: 11 }}>{caseTypeLabel(c.caseType)}</span></td>
              <td><span className={`${styles.badge} ${severityClass(c.severity)}`}>{{ high:'고위험', medium:'중위험', low:'저위험' }[c.severity]}</span></td>
              <td style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.description}</td>
              <td style={{ fontSize: 12, color: '#8B8FA8', whiteSpace: 'nowrap' }}>{c.detectedAt}</td>
              <td><span className={`${styles.badge} ${statusClass(c.status)}`}>{statusLabel(c.status)}</span></td>
              <td>
                <button className={styles.actionBtn} onClick={() => setSelected(c)}>상세</button>
                {c.status === 'open' && (
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => updateStatus(c.id, 'investigating')}>조사 시작</button>
                )}
                {c.status === 'investigating' && (
                  <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => updateStatus(c.id, 'resolved')}>해결</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>감지 케이스 #{selected.id}</h2>
              <button className={styles.modalClose} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>회원번호</span>
              <span className={styles.infoValue}>{selected.memberNo}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>이름</span>
              <span className={styles.infoValue}>{selected.memberName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>감지 유형</span>
              <span className={styles.infoValue}>{caseTypeLabel(selected.caseType)}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>위험도</span>
              <span className={`${styles.badge} ${severityClass(selected.severity)}`}>{{ high:'고위험', medium:'중위험', low:'저위험' }[selected.severity]}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>상세 내용</span>
              <span className={styles.infoValue}>{selected.description}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>감지 일시</span>
              <span className={styles.infoValue}>{selected.detectedAt}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>현재 상태</span>
              <span className={`${styles.badge} ${statusClass(selected.status)}`}>{statusLabel(selected.status)}</span>
            </div>
            <div className={styles.modalActions}>
              {selected.status === 'open' && (
                <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => updateStatus(selected.id, 'investigating')}>조사 시작</button>
              )}
              {selected.status === 'investigating' && (
                <button className={`${styles.actionBtn} ${styles.actionBtnPrimary}`} onClick={() => updateStatus(selected.id, 'resolved')}>해결 처리</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuspiciousPage;
