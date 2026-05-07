import React, { useState } from 'react';
import styles from './MyWalletPage.module.css';
import { useToast } from '../../components/Toast';

interface Props { onBack: () => void; }

const BANKS = [
  '국민은행', '신한은행', '우리은행', 'KEB하나은행', '농협은행',
  '기업은행', '카카오뱅크', '토스뱅크', '케이뱅크', '씨티은행',
  '부산은행', '대구은행', '경남은행', '광주은행', '전북은행',
];

interface AccountInfo {
  bank: string;
  accountNumber: string;
  holder: string;
  verified: boolean;
}

interface Transaction {
  id: number;
  type: 'deposit' | 'withdraw';
  amount: number;
  description: string;
  date: string;
  status: '완료' | '대기' | '취소';
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, type: 'deposit', amount: 50000, description: '잔액 충전', date: '2026.04.25', status: '완료' },
  { id: 2, type: 'withdraw', amount: 43000, description: '나이키 에어맥스 90 구매', date: '2026.04.23', status: '완료' },
  { id: 3, type: 'deposit', amount: 280000, description: 'LG 모니터 판매 수익', date: '2026.04.20', status: '완료' },
  { id: 4, type: 'withdraw', amount: 120000, description: '무인양품 소파 구매', date: '2026.04.18', status: '완료' },
  { id: 5, type: 'deposit', amount: 100000, description: '잔액 충전', date: '2026.04.15', status: '완료' },
];

type TabType = '잔액/충전' | '계좌 관리' | '거래 내역';

const MyWalletPage: React.FC<Props> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('잔액/충전');
  const [balance, setBalance] = useState(267000);

  // 충전
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositMode, setDepositMode] = useState(false);

  // 출금
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMode, setWithdrawMode] = useState(false);

  // 계좌 등록
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [newBank, setNewBank] = useState('');
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newHolder, setNewHolder] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const QUICK_AMOUNTS = [10000, 30000, 50000, 100000];

  const formatPrice = (val: string) => {
    const num = val.replace(/[^0-9]/g, '');
    return num ? Number(num).toLocaleString() : '';
  };

  const handleDeposit = async () => {
    const amount = parseInt(depositAmount.replace(/,/g, ''), 10);
    if (!amount || amount < 1000) { showToast('최소 1,000원 이상 충전 가능해요', 'warning'); return; }
    setDepositLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setBalance(p => p + amount);
    setDepositAmount('');
    setDepositLoading(false);
    showToast(`${amount.toLocaleString()} 충전 완료!`, 'success');
  };

  const handleWithdraw = async () => {
    const amount = parseInt(withdrawAmount.replace(/,/g, ''), 10);
    if (!amount || amount < 1000) { showToast('최소 1,000원 이상 출금 가능해요', 'warning'); return; }
    if (amount > balance) { showToast('잔액이 부족해요', 'error'); return; }
    if (!account) { showToast('출금 계좌를 먼저 등록해주세요', 'warning'); setActiveTab('계좌 관리'); return; }
    setWithdrawLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setBalance(p => p - amount);
    setWithdrawAmount('');
    setWithdrawLoading(false);
    showToast(`${amount.toLocaleString()} 출금 신청 완료!\n영업일 1~2일 내 입금됩니다.`, 'success');
  };

  const handleVerifyAccount = async () => {
    const e: Record<string, string> = {};
    if (!newBank) e.bank = '은행을 선택해주세요';
    if (!newAccountNumber.trim()) e.accountNumber = '계좌번호를 입력해주세요';
    else if (!/^\d{10,14}$/.test(newAccountNumber.replace(/-/g, ''))) e.accountNumber = '올바른 계좌번호를 입력해주세요';
    if (!newHolder.trim()) e.holder = '예금주명을 입력해주세요';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setVerifyLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setVerifyLoading(false);
    setAccount({ bank: newBank, accountNumber: newAccountNumber, holder: newHolder, verified: true });
    setShowAccountForm(false);
    showToast('계좌 인증이 완료됐어요!', 'success');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.title}>내 계좌 / 잔액</span>
        <div style={{ width: 32 }}/>
      </div>

      {/* 잔액 카드 */}
      <div className={styles.balanceCard}>
        <p className={styles.balanceLabel}>사용 가능 잔액</p>
        <p className={styles.balanceAmount}> {balance.toLocaleString()}</p>
        <div className={styles.balanceBtns}>
          <button
            className={`${styles.balanceBtn} ${depositMode ? styles.balanceBtnDepositActive : styles.balanceBtnOutline}`}
            onClick={() => { setDepositMode(p => !p); setWithdrawMode(false); setActiveTab('잔액/충전'); }}
          >충전하기</button>
          <button
            className={`${styles.balanceBtn} ${withdrawMode ? styles.balanceBtnWithdraw : styles.balanceBtnOutline}`}
            onClick={() => { setWithdrawMode(p => !p); setDepositMode(false); setActiveTab('계좌 관리'); }}
          >출금하기</button>
        </div>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        {(['잔액/충전', '계좌 관리', '거래 내역'] as TabType[]).map(t => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t)}
          >{t}</button>
        ))}
      </div>

      <div className={styles.content}>

        {/* ── 잔액/충전 탭 ── */}
        {activeTab === '잔액/충전' && (
          <div className={styles.section}>
            <p className={styles.sectionTitle}>충전 금액</p>
            <div className={styles.quickAmounts}>
              {QUICK_AMOUNTS.map(a => (
                <button
                  key={a}
                  className={styles.quickBtn}
                  onClick={() => setDepositAmount(a.toLocaleString())}
                >+{(a / 10000).toFixed(0)}만원</button>
              ))}
            </div>
            <div className={styles.inputRow}>
              <span className={styles.inputPrefix}></span>
              <input
                className={styles.input}
                placeholder="직접 입력"
                value={depositAmount}
                onChange={e => setDepositAmount(formatPrice(e.target.value))}
                inputMode="numeric"
              />
            </div>
            <div className={styles.infoBox}>
              <p className={styles.infoText}>💡 충전 방법</p>
              <p className={styles.infoDesc}>아래 가상계좌로 입금하시면 자동 충전됩니다.</p>
              <div className={styles.virtualAccount}>
                <div className={styles.vaRow}>
                  <span className={styles.vaLabel}>은행</span>
                  <span className={styles.vaValue}>국민은행</span>
                </div>
                <div className={styles.vaRow}>
                  <span className={styles.vaLabel}>계좌번호</span>
                  <span className={styles.vaValue}>123-456-789012</span>
                </div>
                <div className={styles.vaRow}>
                  <span className={styles.vaLabel}>예금주</span>
                  <span className={styles.vaValue}>(주)바자</span>
                </div>
              </div>
            </div>
            <button
              className={`${styles.actionBtn} ${depositLoading ? styles.loading : ''}`}
              onClick={handleDeposit}
              disabled={depositLoading || !depositAmount}
            >
              {depositLoading ? '처리 중...' : '충전하기'}
            </button>
          </div>
        )}

        {/* ── 계좌 관리 탭 ── */}
        {activeTab === '계좌 관리' && (
          <div className={styles.section}>
            {account && !showAccountForm ? (
              <>
                <p className={styles.sectionTitle}>등록된 계좌</p>
                <div className={styles.accountCard}>
                  <div className={styles.accountHeader}>
                    <span className={styles.accountBank}>🏦 {account.bank}</span>
                    <span className={styles.verifiedBadge}>✓ 인증완료</span>
                  </div>
                  <p className={styles.accountNumber}>{account.accountNumber}</p>
                  <p className={styles.accountHolder}>예금주: {account.holder}</p>
                  <div className={styles.accountBtns}>
                    <button className={styles.accountChangeBtn} onClick={() => setShowAccountForm(true)}>계좌 변경</button>
                    <button className={styles.accountDeleteBtn} onClick={() => setAccount(null)}>삭제</button>
                  </div>
                </div>

                <p className={styles.sectionTitle} style={{ marginTop: 24 }}>출금 신청</p>
                <div className={styles.inputRow}>
                  <span className={styles.inputPrefix}></span>
                  <input
                    className={styles.input}
                    placeholder="출금할 금액 입력"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(formatPrice(e.target.value))}
                    inputMode="numeric"
                  />
                </div>
                <p className={styles.balanceHint}>출금 가능 잔액: {balance.toLocaleString()}</p>
                <button
                  className={`${styles.actionBtn} ${withdrawLoading ? styles.loading : ''}`}
                  onClick={handleWithdraw}
                  disabled={withdrawLoading || !withdrawAmount}
                >
                  {withdrawLoading ? '처리 중...' : '출금 신청'}
                </button>
              </>
            ) : (
              <>
                <p className={styles.sectionTitle}>{account ? '계좌 변경' : '계좌 등록'}</p>
                <p className={styles.sectionDesc}>판매 수익금 출금을 위해 계좌를 등록해주세요</p>

                {/* 은행 선택 */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>은행 선택 *</label>
                  <select
                    className={`${styles.select} ${errors.bank ? styles.inputError : ''}`}
                    value={newBank}
                    onChange={e => { setNewBank(e.target.value); setErrors(p => ({ ...p, bank: '' })); }}
                  >
                    <option value="">은행을 선택해주세요</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errors.bank && <p className={styles.fieldError}>{errors.bank}</p>}
                </div>

                {/* 계좌번호 */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>계좌번호 *</label>
                  <input
                    className={`${styles.inputFull} ${errors.accountNumber ? styles.inputError : ''}`}
                    placeholder="- 없이 숫자만 입력"
                    value={newAccountNumber}
                    onChange={e => { setNewAccountNumber(e.target.value.replace(/[^0-9]/g, '')); setErrors(p => ({ ...p, accountNumber: '' })); }}
                    inputMode="numeric"
                    maxLength={14}
                  />
                  {errors.accountNumber && <p className={styles.fieldError}>{errors.accountNumber}</p>}
                </div>

                {/* 예금주 */}
                <div className={styles.inputGroup}>
                  <label className={styles.label}>예금주명 *</label>
                  <input
                    className={`${styles.inputFull} ${errors.holder ? styles.inputError : ''}`}
                    placeholder="예금주명을 입력해주세요"
                    value={newHolder}
                    onChange={e => { setNewHolder(e.target.value); setErrors(p => ({ ...p, holder: '' })); }}
                  />
                  {errors.holder && <p className={styles.fieldError}>{errors.holder}</p>}
                </div>

                <div className={styles.formBtns}>
                  {account && (
                    <button className={styles.cancelBtn} onClick={() => setShowAccountForm(false)}>취소</button>
                  )}
                  <button
                    className={`${styles.actionBtn} ${verifyLoading ? styles.loading : ''}`}
                    onClick={handleVerifyAccount}
                    disabled={verifyLoading}
                  >
                    {verifyLoading ? '인증 중...' : '계좌 인증하기'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── 거래 내역 탭 ── */}
        {activeTab === '거래 내역' && (
          <div>
            {MOCK_TRANSACTIONS.map(tx => (
              <div key={tx.id} className={styles.txItem}>
                <div className={`${styles.txIcon} ${tx.type === 'deposit' ? styles.txDeposit : styles.txWithdraw}`}>
                  {tx.type === 'deposit' ? '↓' : '↑'}
                </div>
                <div className={styles.txBody}>
                  <p className={styles.txDesc}>{tx.description}</p>
                  <p className={styles.txDate}>{tx.date}</p>
                </div>
                <div className={styles.txRight}>
                  <p className={`${styles.txAmount} ${tx.type === 'deposit' ? styles.txAmountPos : styles.txAmountNeg}`}>
                    {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toLocaleString()}
                  </p>
                  <p className={styles.txStatus}>{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyWalletPage;
