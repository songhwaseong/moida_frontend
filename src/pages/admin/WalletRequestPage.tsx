import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  cancelAdminDeposit,
  cancelAdminWithdrawal,
  confirmAdminDeposit,
  confirmAdminWithdrawal,
  getAdminWalletTransactions,
  type AdminWalletTransactionDto,
} from '../../api/adminWallet';
import type { WalletTransactionStatus, WalletTransactionType } from '../../api/wallet';
import s from './admin.module.css';

type TypeFilter = 'ALL' | WalletTransactionType;

const TYPE_LABEL: Record<WalletTransactionType, string> = {
  DEPOSIT: '입금',
  WITHDRAW: '출금',
};

const STATUS_LABEL: Record<WalletTransactionStatus, string> = {
  PENDING: '대기',
  COMPLETED: '완료',
  CANCELED: '취소',
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const WalletRequestPage: React.FC = () => {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<WalletTransactionStatus>('PENDING');
  const [transactions, setTransactions] = useState<AdminWalletTransactionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminWalletTransactions({
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        status: statusFilter,
        size: 100,
      });
      setTransactions(data);
    } catch (err) {
      console.error(err);
      setError('지갑 요청 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTransactions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadTransactions]);

  const summary = useMemo(() => ({
    total: transactions.length,
    deposits: transactions.filter(t => t.type === 'DEPOSIT').length,
    withdrawals: transactions.filter(t => t.type === 'WITHDRAW').length,
    amount: transactions.reduce((sum, t) => sum + t.amount, 0),
  }), [transactions]);

  const handleConfirm = async (transaction: AdminWalletTransactionDto) => {
    if (transaction.status !== 'PENDING') return;
    const ok = window.confirm(`${TYPE_LABEL[transaction.type]} 요청 ${transaction.amount.toLocaleString()}원을 승인할까요?`);
    if (!ok) return;

    setActionId(transaction.id);
    setError(null);
    setMessage(null);
    try {
      if (transaction.type === 'DEPOSIT') {
        await confirmAdminDeposit(transaction.id);
      } else {
        await confirmAdminWithdrawal(transaction.id);
      }
      setMessage(`${TYPE_LABEL[transaction.type]} 요청을 승인했습니다.`);
      await loadTransactions();
    } catch (err) {
      console.error(err);
      setError(`${TYPE_LABEL[transaction.type]} 요청 승인에 실패했습니다.`);
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async (transaction: AdminWalletTransactionDto) => {
    if (transaction.status !== 'PENDING') return;
    const ok = window.confirm(`${TYPE_LABEL[transaction.type]} 요청 ${transaction.amount.toLocaleString()}원을 취소할까요?`);
    if (!ok) return;

    setActionId(transaction.id);
    setError(null);
    setMessage(null);
    try {
      if (transaction.type === 'DEPOSIT') {
        await cancelAdminDeposit(transaction.id);
      } else {
        await cancelAdminWithdrawal(transaction.id);
      }
      setMessage(`${TYPE_LABEL[transaction.type]} 요청을 취소했습니다.`);
      await loadTransactions();
    } catch (err) {
      console.error(err);
      setError(`${TYPE_LABEL[transaction.type]} 요청 취소에 실패했습니다.`);
    } finally {
      setActionId(null);
    }
  };

  const statusClassName = (status: WalletTransactionStatus) => {
    if (status === 'COMPLETED') return s.badgeApproved;
    if (status === 'CANCELED') return s.badgeRejected;
    return s.badgePending;
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>지갑 요청</div>
        <div className={s.subtitle}>입금과 출금 요청을 확인하고 승인합니다.</div>
      </div>

      <div className={s.statRow}>
        <div className={s.statCard}>
          <div className={s.statNum}>{summary.total}</div>
          <div className={s.statLabel}>조회된 요청</div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumGreen}`}>{summary.deposits}</div>
          <div className={s.statLabel}>입금 요청</div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumAmber}`}>{summary.withdrawals}</div>
          <div className={s.statLabel}>출금 요청</div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumRed}`}>{summary.amount.toLocaleString()}</div>
          <div className={s.statLabel}>요청 금액 합계</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as TypeFilter)}
          style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 120 }}
        >
          <option value="ALL">전체 유형</option>
          <option value="DEPOSIT">입금</option>
          <option value="WITHDRAW">출금</option>
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as WalletTransactionStatus)}
          style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 120 }}
        >
          <option value="PENDING">대기</option>
          <option value="COMPLETED">완료</option>
          <option value="CANCELED">취소</option>
        </select>
        <button className={s.actionBtn} onClick={() => void loadTransactions()} disabled={loading}>
          {loading ? '조회 중' : '새로고침'}
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#8B8FA8' }}>최대 100건</span>
      </div>

      {message && (
        <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: '#EAF7EC', color: '#2E7D32', fontSize: 13 }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: '#FDEEED', color: '#C62828', fontSize: 13 }}>
          {error}
        </div>
      )}

      <table className={s.table} style={{ tableLayout: 'fixed' }}>
        <colgroup>
          <col style={{ width: '72px' }} />
          <col style={{ width: '72px' }} />
          <col style={{ width: '96px' }} />
          <col style={{ width: '150px' }} />
          <col style={{ width: '180px' }} />
          <col style={{ width: '120px' }} />
          <col style={{ width: '220px' }} />
          <col style={{ width: '132px' }} />
          <col style={{ width: '80px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>ID</th>
            <th>유형</th>
            <th>상태</th>
            <th>회원번호</th>
            <th>회원</th>
            <th>금액</th>
            <th>출금 계좌</th>
            <th>요청일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={9} className={s.emptyText}>지갑 요청을 불러오는 중입니다.</td></tr>
          )}
          {!loading && transactions.length === 0 && (
            <tr><td colSpan={9} className={s.emptyText}>조건에 맞는 지갑 요청이 없습니다.</td></tr>
          )}
          {!loading && transactions.map(transaction => (
            <tr key={transaction.id}>
              <td style={{ fontSize: 12, color: '#8B8FA8', fontFamily: 'monospace' }}>{transaction.id}</td>
              <td>{TYPE_LABEL[transaction.type]}</td>
              <td><span className={`${s.badge} ${statusClassName(transaction.status)}`}>{STATUS_LABEL[transaction.status]}</span></td>
              <td style={{ fontSize: 12, color: '#8B8FA8', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{transaction.memberNo}</td>
              <td style={{ textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <strong>{transaction.memberName}</strong>
                <br />
                <span style={{ fontSize: 12, color: '#8B8FA8' }}>{transaction.memberEmail}</span>
              </td>
              <td style={{ fontWeight: 700 }}>{transaction.amount.toLocaleString()}</td>
              <td style={{ fontSize: 12, color: transaction.account ? '#1A1A1A' : '#8B8FA8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {transaction.type === 'WITHDRAW' && transaction.account
                  ? `${transaction.account.bank} ${transaction.account.accountNumber} (${transaction.account.holder})`
                  : '-'}
              </td>
              <td style={{ fontSize: 12, color: '#8B8FA8' }}>{formatDate(transaction.createdAt)}</td>
              <td>
                {transaction.status === 'PENDING' ? (
                  <>
                    <button
                      className={s.actionBtn}
                      style={{ color: '#2E7D32', borderColor: '#2E7D32' }}
                      onClick={() => void handleConfirm(transaction)}
                      disabled={actionId === transaction.id}
                    >
                      {actionId === transaction.id ? '처리중' : '승인'}
                    </button>
                    <button
                      className={`${s.actionBtn} ${s.actionBtnDanger}`}
                      onClick={() => void handleCancel(transaction)}
                      disabled={actionId === transaction.id}
                    >
                      취소
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: '#8B8FA8' }}>{STATUS_LABEL[transaction.status]}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WalletRequestPage;
