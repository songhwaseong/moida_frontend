import React, { useState } from 'react';
import styles from './EditProfilePage.module.css';

interface Props {
  onBack: () => void;
  onSave?: (data: { nickname: string; phone: string }) => void;
}

type Section = 'main' | 'password';

const EditProfilePage: React.FC<Props> = ({ onBack, onSave }) => {
  const [section, setSection] = useState<Section>('main');

  // 프로필 정보
  const [nickname, setNickname] = useState('홍길동');
  const [phone, setPhone] = useState('010-1234-5678');
  const [avatar, setAvatar] = useState('😊');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // 비밀번호 변경
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState({ cur: false, new: false, con: false });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwLoading, setPwLoading] = useState(false);
  const [pwOk, setPwOk] = useState(false);

  const AVATARS = ['😊', '😎', '🥳', '🤩', '😄', '🦊', '🐱', '🐶', '🐼', '🦁'];

  const validateProfile = () => {
    const e: Record<string, string> = {};
    if (!nickname.trim()) e.nickname = '닉네임을 입력해주세요';
    else if (nickname.length < 2) e.nickname = '닉네임은 2자 이상이어야 해요';
    if (!phone.trim()) e.phone = '휴대폰 번호를 입력해주세요';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validateProfile()) return;
    setSaveLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setSaveLoading(false);
    setSavedOk(true);
    onSave?.({ nickname, phone });
    setTimeout(() => setSavedOk(false), 2000);
  };

  const validatePassword = () => {
    const e: Record<string, string> = {};
    if (!currentPw) e.currentPw = '현재 비밀번호를 입력해주세요';
    if (!newPw) e.newPw = '새 비밀번호를 입력해주세요';
    else if (newPw.length < 8) e.newPw = '비밀번호는 8자 이상이어야 해요';
    if (!confirmPw) e.confirmPw = '비밀번호를 다시 입력해주세요';
    else if (newPw !== confirmPw) e.confirmPw = '비밀번호가 일치하지 않아요';
    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePwChange = async () => {
    if (!validatePassword()) return;
    setPwLoading(true);
    await new Promise(r => setTimeout(r, 700));
    setPwLoading(false);
    setPwOk(true);
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setTimeout(() => { setPwOk(false); setSection('main'); }, 1500);
  };

  const pwStrength = () => {
    if (!newPw) return null;
    if (newPw.length < 6) return { label: '약함', color: '#E24B4A', width: '30%' };
    if (newPw.length < 10) return { label: '보통', color: '#EF9F27', width: '60%' };
    return { label: '강함', color: '#3B6D11', width: '100%' };
  };
  const strength = pwStrength();

  if (section === 'password') {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => setSection('main')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          </button>
          <span className={styles.title}>비밀번호 변경</span>
          <div style={{width:32}}/>
        </div>

        <div className={styles.form}>
          {[
            { key:'currentPw', label:'현재 비밀번호', val:currentPw, set:setCurrentPw, show:showPw.cur, toggleKey:'cur' as const },
            { key:'newPw', label:'새 비밀번호', val:newPw, set:setNewPw, show:showPw.new, toggleKey:'new' as const },
            { key:'confirmPw', label:'새 비밀번호 확인', val:confirmPw, set:setConfirmPw, show:showPw.con, toggleKey:'con' as const },
          ].map(field => (
            <div key={field.key} className={styles.inputGroup}>
              <label className={styles.label}>{field.label}</label>
              <div className={styles.pwWrap}>
                <input
                  className={`${styles.input} ${(pwErrors as Record<string,string>)[field.key] ? styles.inputError : ''}`}
                  type={field.show ? 'text' : 'password'}
                  placeholder="입력해주세요"
                  value={field.val}
                  onChange={e => field.set(e.target.value)}
                />
                <button className={styles.pwToggle} onClick={() => setShowPw(p => ({...p,[field.toggleKey]:!p[field.toggleKey]}))}>
                  {field.show ? '숨기기' : '보기'}
                </button>
              </div>
              {field.key==='newPw' && strength && (
                <div className={styles.strengthWrap}>
                  <div className={styles.strengthBar}><div className={styles.strengthFill} style={{width:strength.width,background:strength.color}}/></div>
                  <span className={styles.strengthLabel} style={{color:strength.color}}>{strength.label}</span>
                </div>
              )}
              {field.key==='confirmPw' && confirmPw && newPw===confirmPw && <p className={styles.matchOk}>✓ 비밀번호가 일치해요</p>}
              {(pwErrors as Record<string,string>)[field.key] && <p className={styles.fieldError}>{(pwErrors as Record<string,string>)[field.key]}</p>}
            </div>
          ))}

          {pwOk && <div className={styles.successMsg}>✅ 비밀번호가 변경됐어요!</div>}

          <button
            className={`${styles.saveBtn} ${pwLoading ? styles.loading : ''}`}
            onClick={handlePwChange}
            disabled={pwLoading}
          >
            {pwLoading ? '변경 중...' : '비밀번호 변경'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span className={styles.title}>프로필 수정</span>
        <button
          className={`${styles.saveTopBtn} ${saveLoading ? styles.loading : ''}`}
          onClick={handleSave}
          disabled={saveLoading}
        >
          {saveLoading ? '저장 중' : savedOk ? '✓ 저장됨' : '저장'}
        </button>
      </div>

      {/* 아바타 선택 */}
      <div className={styles.avatarSection}>
        <div className={styles.avatarMain}>{avatar}</div>
        <p className={styles.avatarHint}>아바타 선택</p>
        <div className={styles.avatarGrid}>
          {AVATARS.map(a => (
            <button
              key={a}
              className={`${styles.avatarOpt} ${avatar===a ? styles.avatarOptActive : ''}`}
              onClick={() => setAvatar(a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.form}>
        {/* 닉네임 */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>닉네임</label>
          <input
            className={`${styles.input} ${errors.nickname ? styles.inputError : ''}`}
            type="text"
            value={nickname}
            onChange={e => { setNickname(e.target.value); setErrors(p=>({...p,nickname:''})); }}
            maxLength={12}
          />
          <p className={styles.hint}>{nickname.length}/12</p>
          {errors.nickname && <p className={styles.fieldError}>{errors.nickname}</p>}
        </div>

        {/* 이메일 (읽기 전용) */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>이메일</label>
          <input className={`${styles.input} ${styles.inputReadonly}`} type="email" value="hong@bazar.kr" readOnly/>
          <p className={styles.hint}>이메일은 변경할 수 없어요</p>
        </div>

        {/* 회원번호 (읽기 전용) */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>회원번호</label>
          <input className={`${styles.input} ${styles.inputReadonly}`} type="text" value="2024010100001" readOnly/>
          <p className={styles.hint}>회원번호는 변경할 수 없어요</p>
        </div>

        {/* 휴대폰 번호 */}
        <div className={styles.inputGroup}>
          <label className={styles.label}>휴대폰 번호</label>
          <input
            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
            type="tel"
            value={phone}
            onChange={e => { setPhone(e.target.value); setErrors(p=>({...p,phone:''})); }}
            placeholder="010-0000-0000"
          />
          {errors.phone && <p className={styles.fieldError}>{errors.phone}</p>}
        </div>

        {savedOk && <div className={styles.successMsg}>✅ 프로필이 저장됐어요!</div>}

        {/* 비밀번호 변경 */}
        <button className={styles.pwChangeBtn} onClick={() => setSection('password')}>
          <span>🔒 비밀번호 변경</span>
          <svg width="16" height="16" fill="none" stroke="#B4B2A9" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        {/* 저장 버튼 */}
        <button
          className={`${styles.saveBtn} ${saveLoading ? styles.loading : ''}`}
          onClick={handleSave}
          disabled={saveLoading}
        >
          {saveLoading ? '저장 중...' : '저장하기'}
        </button>

      </div>
    </div>
  );
};

export default EditProfilePage;
