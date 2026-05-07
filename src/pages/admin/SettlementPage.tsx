import React, { useState, useMemo } from 'react';
import s from './admin.module.css';

interface Settlement {
  id: number;
  sellerNo: string;
  buyerNo: string;
  productName: string;
  type: '중고거래' | '경매';
  saleAmount: number;
  feeRate: number;
  feeAmount: number;
  netAmount: number;
  status: '정산완료' | '정산대기' | '보류';
  transactionDate: string;
  settlementDate?: string;
}

interface FeeRule {
  id: number;
  type: '중고거래' | '경매';
  minAmount: number;
  feeRate: number;
  minFee: number;
}

const INITIAL_SETTLEMENTS: Settlement[] = [
  { id: 1,  sellerNo: '2024040100009', buyerNo: '2024031500001', productName: '캐논 EOS R6',                  type: '중고거래', saleAmount: 2650000,  feeRate: 3.5, feeAmount: 92750,   netAmount: 2557250,  status: '정산완료', transactionDate: '2026.04.22', settlementDate: '2026.04.24' },
  { id: 2,  sellerNo: '2024040100009', buyerNo: '2024081200038', productName: '로랜드 피아노',                 type: '중고거래', saleAmount: 1650000,  feeRate: 3.5, feeAmount: 57750,   netAmount: 1592250,  status: '정산완료', transactionDate: '2026.04.18', settlementDate: '2026.04.20' },
  { id: 3,  sellerNo: '2024062000022', buyerNo: '2024070100025', productName: '나이키 조던 1',                 type: '중고거래', saleAmount: 320000,   feeRate: 3.5, feeAmount: 11200,   netAmount: 308800,   status: '정산완료', transactionDate: '2026.04.20', settlementDate: '2026.04.22' },
  { id: 4,  sellerNo: '2024031500001', buyerNo: '2024040100009', productName: '나이키 x 오프화이트 에어포스1', type: '경매',     saleAmount: 980000,   feeRate: 5.0, feeAmount: 49000,   netAmount: 931000,   status: '정산대기', transactionDate: '2026.04.27' },
  { id: 5,  sellerNo: '2024070100025', buyerNo: '2024062000022', productName: 'AP 로얄오크 41mm',              type: '경매',     saleAmount: 35000000, feeRate: 5.0, feeAmount: 1750000, netAmount: 33250000, status: '정산대기', transactionDate: '2026.04.26' },
  { id: 6,  sellerNo: '2024062000022', buyerNo: '2024031500001', productName: '맥북 프로 M3 Pro 16인치',       type: '경매',     saleAmount: 2800000,  feeRate: 5.0, feeAmount: 140000,  netAmount: 2660000,  status: '보류',     transactionDate: '2026.04.25' },
  { id: 7,  sellerNo: '2024070100025', buyerNo: '2024081200038', productName: '구찌 GG 마몽 숄더백',           type: '중고거래', saleAmount: 1250000,  feeRate: 3.5, feeAmount: 43750,   netAmount: 1206250,  status: '정산완료', transactionDate: '2026.04.23', settlementDate: '2026.04.25' },
  { id: 8,  sellerNo: '2024040100009', buyerNo: '2024062000022', productName: 'SK-II 파테르나 크림',           type: '중고거래', saleAmount: 320000,   feeRate: 3.5, feeAmount: 11200,   netAmount: 308800,   status: '정산대기', transactionDate: '2026.04.28' },
  { id: 9,  sellerNo: '2024031500002', buyerNo: '2024100100041', productName: '소니 A7 IV 미러리스',           type: '경매',     saleAmount: 2400000,  feeRate: 3.0, feeAmount: 72000,   netAmount: 2328000,  status: '정산완료', transactionDate: '2026.04.17', settlementDate: '2026.04.19' },
  { id: 10, sellerNo: '2024091500037', buyerNo: '2024031500001', productName: '다이슨 에어랩 컴플리트',        type: '중고거래', saleAmount: 550000,   feeRate: 4.0, feeAmount: 22000,   netAmount: 528000,   status: '정산완료', transactionDate: '2026.04.16', settlementDate: '2026.04.18' },
  { id: 11, sellerNo: '2024050100011', buyerNo: '2024062000022', productName: '롤렉스 데이토나 블랙',          type: '경매',     saleAmount: 22000000, feeRate: 2.0, feeAmount: 440000,  netAmount: 21560000, status: '보류',     transactionDate: '2026.04.15' },
  { id: 12, sellerNo: '2024080100028', buyerNo: '2024070100025', productName: '루이비통 포쉐트 악세수아',      type: '중고거래', saleAmount: 780000,   feeRate: 4.0, feeAmount: 31200,   netAmount: 748800,   status: '정산완료', transactionDate: '2026.04.14', settlementDate: '2026.04.16' },
  { id: 13, sellerNo: '2024110100046', buyerNo: '2024031500002', productName: '닌텐도 스위치 OLED',           type: '중고거래', saleAmount: 280000,   feeRate: 5.0, feeAmount: 14000,   netAmount: 266000,   status: '정산대기', transactionDate: '2026.04.29' },
  { id: 14, sellerNo: '2024031500002', buyerNo: '2024080100028', productName: '에르메스 버킨 25 골드',        type: '경매',     saleAmount: 9800000,  feeRate: 3.0, feeAmount: 294000,  netAmount: 9506000,  status: '정산완료', transactionDate: '2026.04.12', settlementDate: '2026.04.14' },
  { id: 15, sellerNo: '2024050100011', buyerNo: '2024110100046', productName: '발렌시아가 트리플S 스니커즈',   type: '중고거래', saleAmount: 620000,   feeRate: 4.0, feeAmount: 24800,   netAmount: 595200,   status: '정산완료', transactionDate: '2026.04.10', settlementDate: '2026.04.12' },
  { id: 16, sellerNo: '2024091500037', buyerNo: '2024050100011', productName: '아이폰 16 Pro 256GB',          type: '경매',     saleAmount: 1150000,  feeRate: 3.0, feeAmount: 34500,   netAmount: 1115500,  status: '정산대기', transactionDate: '2026.04.29' },
  { id: 17, sellerNo: '2024070100025', buyerNo: '2024091500037', productName: '버버리 트렌치코트 M사이즈',     type: '중고거래', saleAmount: 890000,   feeRate: 4.0, feeAmount: 35600,   netAmount: 854400,   status: '정산완료', transactionDate: '2026.04.08', settlementDate: '2026.04.10' },
  { id: 18, sellerNo: '2024031500001', buyerNo: '2024110100046', productName: '프라다 사피아노 카드지갑',      type: '중고거래', saleAmount: 195000,   feeRate: 5.0, feeAmount: 9750,    netAmount: 185250,   status: '정산완료', transactionDate: '2026.04.07', settlementDate: '2026.04.09' },
];

const INITIAL_FEE_RULES: FeeRule[] = [
  { id: 1, type: '중고거래', minAmount: 0,          feeRate: 5, minFee: 5000     },
  { id: 2, type: '중고거래', minAmount: 500000,     feeRate: 4, minFee: 20000    },
  { id: 3, type: '중고거래', minAmount: 1000000,    feeRate: 3, minFee: 30000    },
  { id: 4, type: '중고거래', minAmount: 10000000,   feeRate: 2, minFee: 200000   },
];

const PAGE_SIZE = 5;

const SettlementPage: React.FC = () => {
  const [tab, setTab] = useState<'settlement' | 'fee'>('settlement');
  const [settlements, setSettlements] = useState<Settlement[]>(INITIAL_SETTLEMENTS);
  const [feeRules, setFeeRules] = useState<FeeRule[]>(INITIAL_FEE_RULES);
  const [filterStatus, setFilterStatus] = useState('전체');
  const [filterType, setFilterType] = useState('전체');
  const [filterRole, setFilterRole] = useState('판매자');
  const [searchNo, setSearchNo] = useState('');
  const [editFee, setEditFee] = useState<FeeRule | null>(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => settlements.filter(t => {
    if (filterStatus !== '전체' && t.status !== filterStatus) return false;
    if (filterType !== '전체' && t.type !== filterType) return false;
    if (searchNo.trim()) {
      const q = searchNo.trim();
      if (filterRole === '판매자' && !t.sellerNo.includes(q)) return false;
      if (filterRole === '구매자' && !t.buyerNo.includes(q)) return false;
    }
    return true;
  }), [settlements, filterStatus, filterType, filterRole, searchNo]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const summary = useMemo(() => ({
    totalSale:    settlements.reduce((acc, t) => acc + t.saleAmount, 0),
    totalFee:     settlements.reduce((acc, t) => acc + t.feeAmount, 0),
    totalNet:     settlements.reduce((acc, t) => acc + t.netAmount, 0),
    pendingCount: settlements.filter(t => t.status === '정산대기').length,
  }), [settlements]);

  const processSettlement = (id: number) => {
    setSettlements(prev => prev.map(t => t.id === id ? { ...t, status: '정산완료', settlementDate: '2026.05.01' } : t));
  };

  const holdSettlement = (id: number) => {
    setSettlements(prev => prev.map(t => t.id === id ? { ...t, status: '보류' } : t));
  };

  const statusColor: Record<Settlement['status'], string> = {
    '정산완료': '#2E7D32', '정산대기': '#E65C00', '보류': '#C62828',
  };
  const statusBg: Record<Settlement['status'], string> = {
    '정산완료': '#EAF7EC', '정산대기': '#FFF3E0', '보류': '#FDEEED',
  };
  const typeColor = { '중고거래': '#3B6D11', '경매': '#E65C00' };
  const typeBg   = { '중고거래': '#EAF3DE', '경매': '#FFF3E0' };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>정산 / 수수료 관리</div>
        <div className={s.subtitle}>거래 정산 현황과 수수료 정책을 관리합니다.</div>
      </div>

      {/* 요약 카드 */}
      <div className={s.statRow}>
        <div className={s.statCard}>
          <div className={s.statNum}>{summary.totalSale.toLocaleString()}</div>
          <div className={s.statLabel}>총 거래금액</div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumAmber}`}>{summary.totalFee.toLocaleString()}</div>
          <div className={s.statLabel}>총 수수료 수익</div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumGreen}`}>{summary.totalNet.toLocaleString()}</div>
          <div className={s.statLabel}>총 정산 금액</div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumRed}`}>{summary.pendingCount}<span style={{ fontSize: 14 }}>건</span></div>
          <div className={s.statLabel}>정산 대기</div>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid #E8E8EF' }}>
        {(['settlement', 'fee'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', fontWeight: tab === t ? 700 : 500, fontSize: 14, color: tab === t ? '#E24B4A' : '#8B8FA8', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #E24B4A' : '2px solid transparent', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', marginBottom: -2 }}>
            {t === 'settlement' ? '정산 내역' : '수수료 정책'}
          </button>
        ))}
      </div>

      {/* 정산 내역 탭 */}
      {tab === 'settlement' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <select
              value={filterRole}
              onChange={e => { setFilterRole(e.target.value); setPage(1); }}
              style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 110 }}
            >
              {['판매자', '구매자'].map(v => <option key={v}>{v}</option>)}
            </select>
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 110 }}
            >
              {['전체', '정산완료', '정산대기', '보류'].map(v => <option key={v}>{v}</option>)}
            </select>
            <input
              value={searchNo}
              onChange={e => { setSearchNo(e.target.value); setPage(1); }}
              placeholder="회원번호 검색"
              style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', width: 180 }}
            />
            <span style={{ fontSize: 13, color: '#8B8FA8', marginLeft: 'auto' }}>총 {filtered.length}건</span>
          </div>
          <table className={s.table}>
            <thead>
              <tr>
                {filterRole !== '구매자' && <th>판매자 회원번호</th>}
                {filterRole !== '판매자' && <th>구매자 회원번호</th>}
                <th>상품</th><th>낙찰가</th><th>수수료</th><th>정산금액</th><th>상태</th><th>거래일</th><th>관리</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(t => (
                <tr key={t.id}>
                  {filterRole !== '구매자' && <td style={{ fontSize: 12, color: '#8B8FA8', fontFamily: 'monospace' }}>{t.sellerNo}</td>}
                  {filterRole !== '판매자' && <td style={{ fontSize: 12, color: '#8B8FA8', fontFamily: 'monospace' }}>{t.buyerNo}</td>}
                  <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.productName}</td>
                  <td>{t.saleAmount.toLocaleString()}</td>
                  <td style={{ color: '#E65C00', fontWeight: 600 }}>{t.feeAmount.toLocaleString()}</td>
                  <td style={{ fontWeight: 700 }}>{t.netAmount.toLocaleString()}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: statusBg[t.status], color: statusColor[t.status] }}>{t.status}</span></td>
                  <td style={{ fontSize: 12, color: '#8B8FA8' }}>{t.transactionDate}</td>
                  <td>
                    {t.status === '정산대기' && <button className={s.actionBtn} style={{ color: '#2E7D32', borderColor: '#2E7D32' }} onClick={() => processSettlement(t.id)}>정산처리</button>}
                    {t.status === '정산대기' && <button className={`${s.actionBtn} ${s.actionBtnDanger}`} onClick={() => holdSettlement(t.id)}>보류</button>}
                    {t.status === '보류' && <button className={s.actionBtn} onClick={() => processSettlement(t.id)}>정산처리</button>}
                    {t.status === '정산완료' && <span style={{ fontSize: 12, color: '#8B8FA8' }}>{t.settlementDate}</span>}
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
        </>
      )}

      {/* 수수료 정책 탭 */}
      {tab === 'fee' && (
        <>
          <table className={s.table}>
            <thead>
              <tr><th>금액 기준</th><th>수수료율</th><th>최소 수수료 (기준금액 × 수수료율)</th><th>관리</th></tr>
            </thead>
            <tbody>
              {feeRules.map(r => {
                const calcMinFee = r.minFee;
                const editCalcMinFee = editFee ? Math.round(editFee.minAmount * editFee.feeRate / 100) : 0;
                return (
                  <tr key={r.id}>
                    <td>
                      {editFee?.id === r.id
                        ? <input type="number" step="10000" style={{ width: 130, padding: '4px 8px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13 }} value={editFee.minAmount} onChange={e => setEditFee(p => p ? { ...p, minAmount: parseInt(e.target.value) || 0, minFee: Math.round((parseInt(e.target.value) || 0) * p.feeRate / 100) } : null)} />
                        : <span style={{ fontWeight: 600 }}>{r.minAmount.toLocaleString()} 이상</span>
                      }
                    </td>
                    <td>
                      {editFee?.id === r.id
                        ? <input type="number" step="1" min="0" max="100" style={{ width: 80, padding: '4px 8px', border: '1px solid #E0E0E0', borderRadius: 6, fontSize: 13 }} value={editFee.feeRate} onChange={e => setEditFee(p => p ? { ...p, feeRate: parseFloat(e.target.value) || 0, minFee: Math.round(p.minAmount * (parseFloat(e.target.value) || 0) / 100) } : null)} />
                        : <span style={{ fontWeight: 700, color: '#E65C00' }}>{r.feeRate}%</span>
                      }
                    </td>
                    <td style={{ color: '#2E7D32', fontWeight: 600 }}>
                      {editFee?.id === r.id
                        ? <span style={{ color: '#2E7D32', fontWeight: 600 }}>{editCalcMinFee.toLocaleString()} <span style={{ fontSize: 11, color: '#8B8FA8', fontWeight: 400 }}>(자동계산)</span></span>
                        : `${calcMinFee.toLocaleString()}`
                      }
                    </td>
                    <td>
                      {editFee?.id === r.id
                        ? <>
                            <button className={s.actionBtnPrimary} style={{ padding: '5px 12px', borderRadius: 6, border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', marginRight: 4 }} onClick={() => { setFeeRules(prev => prev.map(f => f.id === r.id ? { ...f, minAmount: editFee.minAmount, feeRate: editFee.feeRate, minFee: editCalcMinFee } : f)); setEditFee(null); }}>저장</button>
                            <button className={s.actionBtn} onClick={() => setEditFee(null)}>취소</button>
                          </>
                        : <button className={s.actionBtn} onClick={() => setEditFee({ ...r })}>수정</button>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 12, padding: 14, background: '#FFF8E1', borderRadius: 10, fontSize: 13, color: '#856404', lineHeight: 1.6 }}>
            ⚠️ 수수료 변경사항은 변경 이후 체결되는 거래부터 적용됩니다. 진행 중인 경매 및 기존 거래에는 영향을 미치지 않습니다.
          </div>
        </>
      )}
    </div>
  );
};

export default SettlementPage;
