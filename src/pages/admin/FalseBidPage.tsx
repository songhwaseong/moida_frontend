import React, { useState } from 'react';
import styles from './admin.module.css';

type BidStatus = 'open' | 'investigating' | 'resolved';

interface FalseBidCase {
  id: number;
  memberNo: string;
  memberName: string;
  auctionItem: string;
  bidAmount: number;
  reason: string;
  detectedAt: string;
  status: BidStatus;
}

const INITIAL_CASES: FalseBidCase[] = [
  { id: 1,  memberNo: '2025011500234', memberName: '김민준', auctionItem: '나이키 에어맥스 270',        bidAmount: 320000,  reason: '반복적인 최고가 입찰 후 취소',           detectedAt: '2026.04.28 14:22', status: 'open' },
  { id: 2,  memberNo: '2024092300891', memberName: '이서연', auctionItem: '애플워치 울트라2',           bidAmount: 950000,  reason: '동일 IP 다계정 입찰 의심',              detectedAt: '2026.04.27 09:15', status: 'investigating' },
  { id: 3,  memberNo: '2025030601102', memberName: '박지훈', auctionItem: '소니 WH-1000XM5',         bidAmount: 180000,  reason: '낙찰 후 결제 미이행 3회',               detectedAt: '2026.04.26 17:40', status: 'open' },
  { id: 4,  memberNo: '2024071200456', memberName: '최수아', auctionItem: '구찌 GG 마몽 백',          bidAmount: 1250000, reason: '비정상적인 단시간 연속 입찰',            detectedAt: '2026.04.25 11:03', status: 'resolved' },
  { id: 5,  memberNo: '2024112800778', memberName: '정도윤', auctionItem: '레고 테크닉 42156',        bidAmount: 220000,  reason: '허위 계정으로 가격 끌어올리기 의심',     detectedAt: '2026.04.24 08:55', status: 'investigating' },
  { id: 6,  memberNo: '2024082000032', memberName: '강지수', auctionItem: '맥북 에어 M2',             bidAmount: 870000,  reason: '낙찰 후 연락 두절 및 결제 거부',        detectedAt: '2026.04.23 13:10', status: 'open' },
  { id: 7,  memberNo: '2024031500033', memberName: '윤서준', auctionItem: '다이슨 V15 청소기',        bidAmount: 430000,  reason: '동일 기기 다계정 입찰 감지',             detectedAt: '2026.04.22 10:55', status: 'investigating' },
  { id: 8,  memberNo: '2024100200145', memberName: '이하린', auctionItem: '에르메스 버킨25',          bidAmount: 8500000, reason: '비정상 자동 입찰 봇 의심',              detectedAt: '2026.04.21 08:30', status: 'open' },
  { id: 9,  memberNo: '2024050700267', memberName: '홍민재', auctionItem: '롤렉스 서브마리너',        bidAmount: 12000000, reason: '셀러-바이어 담합 입찰 의심',           detectedAt: '2026.04.20 15:45', status: 'resolved' },
  { id: 10, memberNo: '2023110800389', memberName: '신예은', auctionItem: '소니 A7C II',             bidAmount: 2200000, reason: '반복 최고가 입찰 후 취소 (5회)',         detectedAt: '2026.04.19 11:22', status: 'open' },
  { id: 11, memberNo: '2024020100412', memberName: '조민호', auctionItem: 'PS5 + 듀얼센스 번들',      bidAmount: 750000,  reason: '낙찰 후 결제 미이행 2회',               detectedAt: '2026.04.18 17:00', status: 'investigating' },
  { id: 12, memberNo: '2024060900501', memberName: '류지민', auctionItem: '샤넬 클래식 플랩 미디엄', bidAmount: 9800000, reason: '동일 IP 자전 입찰 의심',                 detectedAt: '2026.04.17 09:05', status: 'open' },
  { id: 13, memberNo: '2024090300622', memberName: '전하은', auctionItem: '아이패드 프로 M4',        bidAmount: 1350000, reason: '연속 입찰 후 즉시 취소 반복 (4회)',      detectedAt: '2026.04.16 14:40', status: 'resolved' },
  { id: 14, memberNo: '2024030800744', memberName: '문현우', auctionItem: '니콘 Z6 III',            bidAmount: 2850000, reason: '다계정 가격 조작 의심',                  detectedAt: '2026.04.15 16:20', status: 'investigating' },
  { id: 15, memberNo: '2024120100856', memberName: '배소연', auctionItem: '루이비통 네버풀 MM',      bidAmount: 1650000, reason: '낙찰 후 환불 요구 반복',                 detectedAt: '2026.04.14 10:15', status: 'open' },
];

const statusLabel = (s: BidStatus) => ({ open: '신규', investigating: '조사중', resolved: '해결' }[s]);
const statusClass = (s: BidStatus) => ({ open: styles.badgeOpen, investigating: styles.badgeInvestigating, resolved: styles.badgeResolved }[s]);

const PAGE_SIZE = 5;

const FalseBidPage: React.FC = () => {
  const [list, setList] = useState<FalseBidCase[]>(INITIAL_CASES);
  const [selected, setSelected] = useState<FalseBidCase | null>(null);
  const [page, setPage] = useState(1);

  const updateStatus = (id: number, status: BidStatus) => {
    setList(prev => prev.map(c => c.id === id ? { ...c, status } : c));
    setSelected(null);
  };

  const open = list.filter(c => c.status === 'open').length;
  const investigating = list.filter(c => c.status === 'investigating').length;
  const resolved = list.filter(c => c.status === 'resolved').length;

  const totalPages = Math.ceil(list.length / PAGE_SIZE);
  const paged = list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>허위입찰 관리</h1>
        <p className={styles.subtitle}>비정상 입찰 행위가 감지된 케이스를 조사하고 처리합니다</p>
      </div>

      <div className={styles.statRow}>
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
            <th>회원번호</th>
            <th>이름</th>
            <th>경매 상품</th>
            <th>입찰금액</th>
            <th>의심 사유</th>
            <th>감지 일시</th>
            <th>상태</th>
            <th>처리</th>
          </tr>
        </thead>
        <tbody>
          {paged.map(c => (
            <tr key={c.id}>

              <td style={{ fontSize: 12 }}>{c.memberNo}</td>
              <td style={{ fontSize: 13, fontWeight: 500 }}>{c.memberName}</td>
              <td style={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.auctionItem}</td>
              <td style={{ fontSize: 12 }}>{c.bidAmount.toLocaleString()}</td>
              <td style={{ fontSize: 12, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.reason}</td>
              <td style={{ fontSize: 12, color: '#8B8FA8', whiteSpace: 'nowrap' }}>{c.detectedAt}</td>
              <td><span className={`${styles.badge} ${statusClass(c.status)}`}>{statusLabel(c.status)}</span></td>
              <td>
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

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: page === 1 ? '#F5F5F5' : '#fff', color: page === 1 ? '#ccc' : '#4A4A6A', cursor: page === 1 ? 'default' : 'pointer', fontSize: 13 }}>이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: page === n ? '#E24B4A' : '#fff', color: page === n ? '#fff' : '#4A4A6A', fontWeight: page === n ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: page === totalPages ? '#F5F5F5' : '#fff', color: page === totalPages ? '#ccc' : '#4A4A6A', cursor: page === totalPages ? 'default' : 'pointer', fontSize: 13 }}>다음</button>
        </div>
      )}

      {selected && (
        <div className={styles.overlay} onClick={() => setSelected(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>허위입찰 케이스 #{selected.id}</h2>
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
              <span className={styles.infoLabel}>경매 상품</span>
              <span className={styles.infoValue}>{selected.auctionItem}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>입찰금액</span>
              <span className={styles.infoValue}>{selected.bidAmount.toLocaleString()}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>의심 사유</span>
              <span className={styles.infoValue}>{selected.reason}</span>
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

export default FalseBidPage;
