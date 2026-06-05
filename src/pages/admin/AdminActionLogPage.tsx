import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { getAdminActionLogs, type AdminActionLogDto } from '../../api/adminActionLogs';
import s from './admin.module.css';

const PAGE_SIZE = 15;

const ACTION_LABELS: Record<string, string> = {
  PRODUCT_UPDATE: '상품 수정',
  PRODUCT_STATUS_CHANGE: '상품 상태',
  PRODUCT_DELETE: '상품 삭제',
  AUCTION_STATUS_CHANGE: '경매 상태',
  AUCTION_POLICY_UPDATE: '경매 정책',
  SETTLEMENT_STATUS_CHANGE: '정산 상태',
  FEE_RULE_UPDATE: '수수료 정책',
  INQUIRY_ANSWER: '문의 답변',
  INQUIRY_ANSWER_DELETE: '답변 삭제',
  INQUIRY_DELETE: '문의 삭제',
  SANCTION_CREATE: '회원 제재',
  CATEGORY_VISIBILITY_CHANGE: '카테고리 노출',
  CATEGORY_REORDER: '카테고리 순서',
  MEMBER_ROLE_CHANGE: '회원 권한',
  FAQ_CREATE: 'FAQ 등록',
  FAQ_UPDATE: 'FAQ 수정',
  FAQ_DELETE: 'FAQ 삭제',
  NOTICE_CREATE: '공지 등록',
  NOTICE_UPDATE: '공지 수정',
  NOTICE_DELETE: '공지 삭제',
  WALLET_DEPOSIT_CONFIRM: '입금 승인',
  WALLET_WITHDRAWAL_CONFIRM: '출금 승인',
  WALLET_DEPOSIT_CANCEL: '입금 취소',
  WALLET_WITHDRAWAL_CANCEL: '출금 취소',
  CHAT_ROOM_STATUS_CHANGE: '채팅방 상태',
  CHAT_MESSAGE_HIDE: '메시지 숨김',
};

const TARGET_LABELS: Record<string, string> = {
  PRODUCT: '상품',
  AUCTION: '경매',
  AUCTION_POLICY: '경매 정책',
  SETTLEMENT: '정산',
  FEE_RULE: '수수료',
  INQUIRY: '문의',
  MEMBER: '회원',
  CATEGORY: '카테고리',
  FAQ: 'FAQ',
  NOTICE: '공지',
  WALLET_TRANSACTION: '지갑',
  CHAT_ROOM: '채팅방',
  CHAT_MESSAGE: '채팅 메시지',
};

const AdminActionLogPage: React.FC = () => {
  const [rows, setRows] = useState<AdminActionLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<AdminActionLogDto | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setRows(await getAdminActionLogs());
    } catch {
      setLoadError('변경 기록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 서버 목록을 가져오는 정상 패턴
  useEffect(() => { reload(); }, [reload]);

  const actionOptions = useMemo(() => {
    const values = Array.from(new Set(rows.map(row => row.actionType))).sort();
    return values.map(value => ({ value, label: ACTION_LABELS[value] ?? value }));
  }, [rows]);

  const filtered = useMemo(() => rows.filter(row => {
    if (actionFilter !== 'all' && row.actionType !== actionFilter) return false;
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [
      row.adminEmail,
      row.actionType,
      ACTION_LABELS[row.actionType],
      row.targetType,
      TARGET_LABELS[row.targetType],
      row.targetName,
      row.reason,
      row.ip,
    ].some(value => (value ?? '').toLowerCase().includes(q));
  }), [rows, actionFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetPage = (fn: () => void) => {
    fn();
    setPage(1);
  };

  const actionBadge = (actionType: string) => (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 72,
      padding: '3px 9px',
      borderRadius: 6,
      background: '#EAF0FB',
      color: '#1E5BB8',
      fontSize: 11,
      fontWeight: 800,
      lineHeight: 1.2,
    }}>
      {ACTION_LABELS[actionType] ?? actionType}
    </span>
  );

  const targetLabel = (row: AdminActionLogDto) => {
    const type = TARGET_LABELS[row.targetType] ?? row.targetType;
    const id = row.targetId == null ? '' : ` #${row.targetId}`;
    return `${type}${id}`;
  };

  const formatLogValue = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    return JSON.stringify(value);
  };

  const flattenLogValue = (value: unknown, prefix = '', result: Record<string, string> = {}) => {
    if (value === null || value === undefined || typeof value !== 'object') {
      result[prefix || 'value'] = formatLogValue(value);
      return result;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        result[prefix || 'value'] = '[]';
        return result;
      }
      value.forEach((item, index) => {
        flattenLogValue(item, `${prefix || 'items'}[${index}]`, result);
      });
      return result;
    }

    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) {
      result[prefix || 'value'] = '{}';
      return result;
    }
    entries.forEach(([key, item]) => {
      flattenLogValue(item, prefix ? `${prefix}.${key}` : key, result);
    });
    return result;
  };

  const toFlatLogValue = (value: string | null) => {
    if (!value) return {};
    try {
      return flattenLogValue(JSON.parse(value));
    } catch {
      return { value };
    }
  };

  const comparisonRows = (row: AdminActionLogDto) => {
    const before = toFlatLogValue(row.beforeValue);
    const after = toFlatLogValue(row.afterValue);
    const fields = Array.from(new Set([...Object.keys(before), ...Object.keys(after)]));
    if (fields.length === 0) {
      return [{ field: '-', before: '-', after: '-' }];
    }
    return fields.map(field => ({
      field,
      before: before[field] ?? '-',
      after: after[field] ?? '-',
    }));
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>관리자 변경 기록</div>
        <div className={s.subtitle}>관리자 화면에서 직접 수행한 변경 작업 기록입니다. (최근 500건)</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select
          value={actionFilter}
          onChange={e => resetPage(() => setActionFilter(e.target.value))}
          style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 140 }}
        >
          <option value="all">전체 작업</option>
          {actionOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
        <input
          value={search}
          onChange={e => resetPage(() => setSearch(e.target.value))}
          placeholder="관리자, 대상, IP 검색"
          style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', width: 240 }}
        />
        <button
          onClick={reload}
          style={{ padding: '8px 14px', borderRadius: 8, border: '1px solid #E0E0E0', background: '#fff', color: '#4A4A6A', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}
        >
          새로고침
        </button>
        <span style={{ fontSize: 13, color: '#8B8FA8', marginLeft: 'auto' }}>총 {filtered.length}건</span>
      </div>

      {loading ? (
        <div className={s.emptyText}>변경 기록을 불러오는 중입니다...</div>
      ) : loadError ? (
        <div className={s.emptyText}>
          {loadError}
          <div style={{ marginTop: 12 }}>
            <button className={s.actionBtn} onClick={reload}>다시 시도</button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className={s.emptyText}>조건에 맞는 변경 기록이 없습니다.</div>
      ) : (
        <table className={s.table}>
          <thead>
            <tr>
              <th>작업</th>
              <th>관리자</th>
              <th>대상</th>
              <th>내용</th>
              <th>IP</th>
              <th>시각</th>
              <th>상세</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(row => (
              <tr key={row.id}>
                <td>{actionBadge(row.actionType)}</td>
                <td style={{ fontSize: 12 }}>{row.adminEmail}</td>
                <td style={{ fontSize: 12, color: '#4A4A6A' }}>{targetLabel(row)}</td>
                <td style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 700 }}>{row.targetName ?? '-'}</div>
                  <div style={{ fontSize: 12, color: '#8B8FA8', marginTop: 2 }}>{row.reason ?? '-'}</div>
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#4A4A6A' }}>{row.ip ?? '-'}</td>
                <td style={{ fontSize: 12, color: '#8B8FA8' }}>{row.createdAt}</td>
                <td>
                  <button className={s.actionBtn} onClick={() => setDetail(row)}>보기</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !loadError && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16 }}>
          <button className={s.pageMoveBtn} onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: page === n ? '#E24B4A' : '#fff', color: page === n ? '#fff' : '#4A4A6A', fontWeight: page === n ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{n}</button>
          ))}
          <button className={s.pageMoveBtn} onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>다음</button>
        </div>
      )}

      {detail && (
        <div className={s.overlay} onClick={() => setDetail(null)}>
          <div className={s.modal} style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <div className={s.modalTitle}>변경 기록 상세</div>
              <button className={s.modalClose} onClick={() => setDetail(null)}>x</button>
            </div>
            <div className={s.infoRow}><span className={s.infoLabel}>작업</span><span className={s.infoValue}>{ACTION_LABELS[detail.actionType] ?? detail.actionType}</span></div>
            <div className={s.infoRow}><span className={s.infoLabel}>관리자</span><span className={s.infoValue}>{detail.adminEmail}</span></div>
            <div className={s.infoRow}><span className={s.infoLabel}>대상</span><span className={s.infoValue}>{targetLabel(detail)} / {detail.targetName ?? '-'}</span></div>
            <div className={s.infoRow}><span className={s.infoLabel}>IP</span><span className={s.infoValue}>{detail.ip ?? '-'}</span></div>
            <div className={s.infoRow}><span className={s.infoLabel}>시각</span><span className={s.infoValue}>{detail.createdAt}</span></div>
            <div className={s.divider} />
            <table className={s.table} style={{ boxShadow: 'none', border: '1px solid #EDEEF2' }}>
              <thead>
                <tr>
                  <th style={{ width: 160 }}>항목</th>
                  <th>변경 전</th>
                  <th>변경 후</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows(detail).map(row => {
                  const changed = row.before !== row.after;
                  return (
                    <tr key={row.field}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#4A4A6A', textAlign: 'left' }}>{row.field}</td>
                      <td style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: changed ? '#FFF8F8' : undefined }}>{row.before}</td>
                      <td style={{ textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-word', background: changed ? '#F3FAF5' : undefined, fontWeight: changed ? 700 : 400 }}>{row.after}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminActionLogPage;
