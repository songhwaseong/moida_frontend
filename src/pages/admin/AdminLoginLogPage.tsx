import React, { useCallback, useEffect, useMemo, useState } from 'react';
import s from './admin.module.css';
import { getAdminLoginLogs, type AdminLoginLogDto, type LoginResult } from '../../api/adminLoginLogs';
import { useRegisterAdminRefresh } from './AdminRefreshContext';

const PAGE_SIZE = 15;

type ResultFilter = 'all' | LoginResult;

const RESULT_LABEL: Record<LoginResult, string> = {
  SUCCESS: '성공',
  FAIL: '실패',
};

const AdminLoginLogPage: React.FC = () => {
  const [rows, setRows] = useState<AdminLoginLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setRows(await getAdminLoginLogs());
    } catch {
      setLoadError('로그인 기록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- 마운트 시 1회 페치, 정상 데이터 로딩 패턴
  useEffect(() => { reload(); }, [reload]);

  useRegisterAdminRefresh(reload, loading);

  const filtered = useMemo(() => rows.filter(r => {
    if (resultFilter !== 'all' && r.result !== resultFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      if (!r.email.toLowerCase().includes(q) && !(r.ip ?? '').toLowerCase().includes(q)) return false;
    }
    return true;
  }), [rows, resultFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const onFilter = (fn: () => void) => { fn(); setPage(1); };

  const badge = (result: LoginResult) => {
    const ok = result === 'SUCCESS';
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
        background: ok ? '#EAF7EC' : '#FDEEED', color: ok ? '#2E7D32' : '#C62828',
      }}>{RESULT_LABEL[result]}</span>
    );
  };

  const roleBadge = (role: string) => (
    <span style={{
      fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20,
      background: role === 'ADMIN' ? '#EAF0FB' : '#F3EFFA',
      color: role === 'ADMIN' ? '#1E5BB8' : '#6A4AC0',
    }}>{role}</span>
  );

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>관리자 접속 기록</div>
        <div className={s.subtitle}>관리자(ADMIN/MANAGER) 계정의 로그인 성공·실패 기록입니다. (최근 500건)</div>
      </div>

      {/* 필터 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <select
          value={resultFilter}
          onChange={e => onFilter(() => setResultFilter(e.target.value as ResultFilter))}
          style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 110 }}
        >
          <option value="all">전체 결과</option>
          <option value="SUCCESS">성공</option>
          <option value="FAIL">실패</option>
        </select>
        <input
          value={search}
          onChange={e => onFilter(() => setSearch(e.target.value))}
          placeholder="계정(이메일) 또는 IP 검색"
          style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', width: 220 }}
        />
        <span style={{ fontSize: 13, color: '#8B8FA8', marginLeft: 'auto' }}>총 {filtered.length}건</span>
      </div>

      {loading ? (
        <div style={{ padding: 40, background: '#fff', border: '1px solid #EDEEF2', borderRadius: 12, textAlign: 'center', color: '#8B8FA8', fontSize: 13 }}>
          로그인 기록을 불러오는 중입니다…
        </div>
      ) : loadError ? (
        <div style={{ padding: 40, background: '#fff', border: '1px solid #EDEEF2', borderRadius: 12, textAlign: 'center', color: '#8B8FA8', fontSize: 13 }}>
          {loadError}
          <div style={{ marginTop: 12 }}>
            <button onClick={reload} style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #E0E0E0', background: '#fff', cursor: 'pointer', fontSize: 13 }}>다시 시도</button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: 40, background: '#fff', border: '1px solid #EDEEF2', borderRadius: 12, textAlign: 'center', color: '#8B8FA8', fontSize: 13 }}>
          조건에 맞는 기록이 없습니다.
        </div>
      ) : (
        <table className={s.table}>
          <thead>
            <tr>
              <th>계정</th><th>역할</th><th>결과</th><th>IP</th><th>접속 시각</th>
            </tr>
          </thead>
          <tbody>
            {paged.map(r => (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>{roleBadge(r.role)}</td>
                <td>{badge(r.result)}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#4A4A6A' }}>{r.ip ?? '-'}</td>
                <td style={{ fontSize: 12, color: '#8B8FA8' }}>{r.loginAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && !loadError && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: page === 1 ? '#F5F5F5' : '#fff', color: page === 1 ? '#ccc' : '#4A4A6A', cursor: page === 1 ? 'default' : 'pointer', fontSize: 13 }}>이전</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: page === n ? '#E24B4A' : '#fff', color: page === n ? '#fff' : '#4A4A6A', fontWeight: page === n ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: page === totalPages ? '#F5F5F5' : '#fff', color: page === totalPages ? '#ccc' : '#4A4A6A', cursor: page === totalPages ? 'default' : 'pointer', fontSize: 13 }}>다음</button>
        </div>
      )}
    </div>
  );
};

export default AdminLoginLogPage;
