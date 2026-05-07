import React, { useState } from 'react';
import styles from './FindAccountPage.module.css';

type Tab = 'id' | 'pw';
type IdStep = 'form' | 'result';
type PwStep = 'form' | 'verify' | 'reset' | 'done';

interface Props {
  onBack: () => void;
  initialTab?: Tab;
}

const FindAccountPage: React.FC<Props> = ({ onBack, initialTab = 'id' }) => {
  const [tab, setTab] = useState<Tab>(initialTab);

  // ── 아이디 찾기 상태 ──
  const [idName, setIdName] = useState('');
  const [idPhone, setIdPhone] = useState('');
  const [idStep, setIdStep] = useState<IdStep>('form');
  const [idError, setIdError] = useState('');
  const [idLoading, setIdLoading] = useState(false);

  // ── 비번 찾기 상태 ──
  const [pwEmail, setPwEmail] = useState('');
  const [pwCode, setPwCode] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [pwStep, setPwStep] = useState<PwStep>('form');
  const [pwError, setPwError] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [codeTimer, setCodeTimer] = useState(0);

  // ── 타이머 ──
  const startTimer = () => {
    setCodeTimer(180);
    const t = setInterval(() => {
      setCodeTimer(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
  };
  const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2,'0')}:${String(s % 60).padStart(2,'0')}`;

  // ── 아이디 찾기 제출 ──
  const handleFindId = async () => {
    setIdError('');
    if (!idName.trim()) { setIdError('이름을 입력해주세요'); return; }
    if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(idPhone.replace(/-/g,''))) {
      setIdError('올바른 휴대폰 번호를 입력해주세요'); return;
    }
    setIdLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setIdLoading(false);
    setIdStep('result');
  };

  // ── 인증코드 발송 ──
  const handleSendCode = async () => {
    setPwError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pwEmail)) {
      setPwError('올바른 이메일 주소를 입력해주세요'); return;
    }
    setPwLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setPwLoading(false);
    setPwStep('verify');
    startTimer();
  };

  // ── 코드 확인 ──
  const handleVerifyCode = async () => {
    setPwError('');
    if (pwCode.length !== 6) { setPwError('인증코드 6자리를 입력해주세요'); return; }
    if (pwCode !== '123456') { setPwError('인증코드가 올바르지 않습니다'); return; }
    setPwLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setPwLoading(false);
    setPwStep('reset');
  };

  // ── 비번 재설정 ──
  const handleResetPw = async () => {
    setPwError('');
    if (pwNew.length < 8) { setPwError('비밀번호는 8자 이상이어야 합니다'); return; }
    if (!/(?=.*[A-Za-z])(?=.*\d)/.test(pwNew)) { setPwError('영문과 숫자를 조합해주세요'); return; }
    if (pwNew !== pwConfirm) { setPwError('비밀번호가 일치하지 않습니다'); return; }
    setPwLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setPwLoading(false);
    setPwStep('done');
  };

  const switchTab = (t: Tab) => {
    setTab(t);
    setIdStep('form'); setIdError(''); setIdName(''); setIdPhone('');
    setPwStep('form'); setPwError(''); setPwEmail(''); setPwCode(''); setPwNew(''); setPwConfirm('');
  };

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.headerTitle}>계정 찾기</span>
        <div style={{ width: 32 }}/>
      </div>

      {/* 탭 */}
      <div className={styles.tabRow}>
        <button className={`${styles.tabBtn} ${tab === 'id' ? styles.tabActive : ''}`} onClick={() => switchTab('id')}>
          아이디 찾기
        </button>
        <button className={`${styles.tabBtn} ${tab === 'pw' ? styles.tabActive : ''}`} onClick={() => switchTab('pw')}>
          비밀번호 찾기
        </button>
      </div>

      <div className={styles.content}>

        {/* ────────── 아이디 찾기 ────────── */}
        {tab === 'id' && idStep === 'form' && (
          <div className={styles.section}>
            <p className={styles.desc}>가입 시 등록한 이름과 휴대폰 번호로<br/>아이디를 찾을 수 있습니다.</p>

            <div className={styles.inputGroup}>
              <label className={styles.label}>이름</label>
              <input
                className={styles.input}
                type="text"
                placeholder="이름을 입력해주세요"
                value={idName}
                onChange={e => { setIdName(e.target.value); setIdError(''); }}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>휴대폰 번호</label>
              <input
                className={styles.input}
                type="tel"
                inputMode="numeric"
                placeholder="010-0000-0000"
                value={idPhone}
                onChange={e => { setIdPhone(e.target.value); setIdError(''); }}
                maxLength={13}
              />
            </div>

            {idError && <p className={styles.errorMsg}>⚠️ {idError}</p>}

            <button className={`${styles.submitBtn} ${idLoading ? styles.loading : ''}`} onClick={handleFindId} disabled={idLoading}>
              {idLoading ? '조회 중...' : '아이디 찾기'}
            </button>
          </div>
        )}

        {tab === 'id' && idStep === 'result' && (
          <div className={styles.section}>
            <div className={styles.resultBox}>
              <div className={styles.resultIcon}>✉️</div>
              <p className={styles.resultLabel}>회원님의 아이디</p>
              <p className={styles.resultEmail}>ba***r@email.com</p>
              <p className={styles.resultSub}>가입일: 2024년 3월 12일</p>
            </div>
            <button className={styles.submitBtn} onClick={onBack}>로그인하러 가기</button>
            <button className={styles.ghostBtn} onClick={() => { setIdStep('form'); setIdName(''); setIdPhone(''); }}>
              다시 찾기
            </button>
          </div>
        )}

        {/* ────────── 비밀번호 찾기 ────────── */}
        {tab === 'pw' && pwStep === 'form' && (
          <div className={styles.section}>
            <p className={styles.desc}>가입 시 사용한 이메일 주소로<br/>인증코드를 발송해 드립니다.</p>

            <div className={styles.inputGroup}>
              <label className={styles.label}>이메일</label>
              <input
                className={styles.input}
                type="email"
                placeholder="example@email.com"
                value={pwEmail}
                onChange={e => { setPwEmail(e.target.value); setPwError(''); }}
                autoComplete="email"
              />
            </div>

            {pwError && <p className={styles.errorMsg}>⚠️ {pwError}</p>}

            <button className={`${styles.submitBtn} ${pwLoading ? styles.loading : ''}`} onClick={handleSendCode} disabled={pwLoading}>
              {pwLoading ? '발송 중...' : '인증코드 발송'}
            </button>
          </div>
        )}

        {tab === 'pw' && pwStep === 'verify' && (
          <div className={styles.section}>
            <div className={styles.sentBadge}>
              <span>📧</span>
              <span><b>{pwEmail}</b>로 인증코드를 발송했습니다</span>
            </div>
            <p className={styles.desc} style={{ marginTop: 4 }}>스팸함도 확인해보세요. (테스트 코드: <b>123456</b>)</p>

            <div className={styles.inputGroup}>
              <label className={styles.label}>인증코드</label>
              <div className={styles.codeWrap}>
                <input
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  placeholder="6자리 코드 입력"
                  value={pwCode}
                  onChange={e => { setPwCode(e.target.value.replace(/\D/g,'')); setPwError(''); }}
                  maxLength={6}
                />
                {codeTimer > 0 && <span className={styles.timer}>{fmtTime(codeTimer)}</span>}
              </div>
            </div>

            {pwError && <p className={styles.errorMsg}>⚠️ {pwError}</p>}

            <button className={`${styles.submitBtn} ${pwLoading ? styles.loading : ''}`} onClick={handleVerifyCode} disabled={pwLoading}>
              {pwLoading ? '확인 중...' : '인증 확인'}
            </button>
            <button className={styles.ghostBtn} onClick={() => { handleSendCode(); }}>
              인증코드 재발송
            </button>
          </div>
        )}

        {tab === 'pw' && pwStep === 'reset' && (
          <div className={styles.section}>
            <p className={styles.desc}>새로운 비밀번호를 입력해주세요.<br/>영문+숫자 조합 8자 이상</p>

            <div className={styles.inputGroup}>
              <label className={styles.label}>새 비밀번호</label>
              <div className={styles.pwWrap}>
                <input
                  className={styles.input}
                  type={showPwNew ? 'text' : 'password'}
                  placeholder="새 비밀번호 (8자 이상)"
                  value={pwNew}
                  onChange={e => { setPwNew(e.target.value); setPwError(''); }}
                />
                <button className={styles.pwToggle} onClick={() => setShowPwNew(p => !p)}>{showPwNew ? '숨기기' : '보기'}</button>
              </div>
              {pwNew && (
                <div className={styles.strengthBar}>
                  <div className={`${styles.strengthFill} ${
                    pwNew.length >= 12 && /(?=.*[!@#$%])/.test(pwNew) ? styles.strong :
                    pwNew.length >= 8 && /(?=.*[A-Za-z])(?=.*\d)/.test(pwNew) ? styles.medium : styles.weak
                  }`}/>
                  <span className={styles.strengthLabel}>
                    {pwNew.length >= 12 && /(?=.*[!@#$%])/.test(pwNew) ? '강함' :
                     pwNew.length >= 8 && /(?=.*[A-Za-z])(?=.*\d)/.test(pwNew) ? '보통' : '약함'}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>비밀번호 확인</label>
              <div className={styles.pwWrap}>
                <input
                  className={`${styles.input} ${pwConfirm && pwConfirm !== pwNew ? styles.inputError : ''}`}
                  type={showPwConfirm ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={pwConfirm}
                  onChange={e => { setPwConfirm(e.target.value); setPwError(''); }}
                />
                <button className={styles.pwToggle} onClick={() => setShowPwConfirm(p => !p)}>{showPwConfirm ? '숨기기' : '보기'}</button>
              </div>
              {pwConfirm && pwConfirm === pwNew && <p className={styles.matchOk}>✓ 비밀번호가 일치합니다</p>}
            </div>

            {pwError && <p className={styles.errorMsg}>⚠️ {pwError}</p>}

            <button className={`${styles.submitBtn} ${pwLoading ? styles.loading : ''}`} onClick={handleResetPw} disabled={pwLoading}>
              {pwLoading ? '변경 중...' : '비밀번호 변경'}
            </button>
          </div>
        )}

        {tab === 'pw' && pwStep === 'done' && (
          <div className={styles.section}>
            <div className={styles.doneBox}>
              <div className={styles.doneCircle}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p className={styles.doneTitle}>비밀번호 변경 완료!</p>
              <p className={styles.doneSub}>새 비밀번호로 로그인해주세요</p>
            </div>
            <button className={styles.submitBtn} onClick={onBack}>로그인하러 가기</button>
          </div>
        )}

      </div>
    </div>
  );
};

export default FindAccountPage;
