import React, { useRef, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import styles from './PasswordlessManagePanel.module.css';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errorCode?: string;
}

interface LoginResponse {
  accessToken: string;
}

interface PasswordlessStatusResponse {
  registered: boolean;
}

interface PasswordlessRegistrationStartResponse {
  qr: string;
  corpId: string;
  registerKey: string;
  terms: number;
  serverUrl: string;
  userId: string;
  pushConnectorUrl: string;
  pushConnectorToken: string;
  expiresInSeconds: number;
}

type ManageMode = 'register' | 'withdraw';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getErrorMessage = (error: unknown, fallback: string) => {
  const response = (error as { response?: { data?: { message?: string } } })?.response;
  return response?.data?.message || fallback;
};

const authHeader = (accessToken: string) => ({
  Authorization: `Bearer ${accessToken}`,
});

const PasswordlessManagePanel: React.FC = () => {
  const [mode, setMode] = useState<ManageMode>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [registration, setRegistration] = useState<PasswordlessRegistrationStartResponse | null>(null);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const loginForPasswordlessManage = async () => {
    if (!email.trim()) throw new Error('이메일을 입력해주세요.');
    if (!EMAIL_PATTERN.test(email)) throw new Error('이메일 형식이 올바르지 않아요.');
    if (!password.trim()) throw new Error('비밀번호를 입력해주세요.');

    const response = await axiosInstance.post<ApiResponse<LoginResponse>>('/auth/login', {
      email: email.trim(),
      password,
    });
    return response.data.data.accessToken;
  };

  const confirmRegistration = async (token = accessToken) => {
    if (!token) return;
    const response = await axiosInstance.post<ApiResponse<PasswordlessStatusResponse>>(
      '/members/me/passwordless/registration/confirm',
      undefined,
      { headers: authHeader(token) }
    );

    if (response.data.data.registered) {
      socketRef.current?.close();
      setRegistration(null);
      setStatus('Passwordless 등록 완료.');
      return;
    }

    setStatus('아직 등록 대기 중. 앱에서 QR 등록 후 다시 확인.');
  };

  const startRegistration = async () => {
    setLoading(true);
    setError('');
    setStatus('');
    socketRef.current?.close();

    try {
      const token = await loginForPasswordlessManage();
      setAccessToken(token);
      const response = await axiosInstance.post<ApiResponse<PasswordlessRegistrationStartResponse>>(
        '/members/me/passwordless/registration/start',
        undefined,
        { headers: authHeader(token) }
      );
      const nextRegistration = response.data.data;
      setRegistration(nextRegistration);
      setStatus('MOIDA 앱에서 QR을 스캔해 등록하세요.');

      if (nextRegistration.pushConnectorUrl && nextRegistration.pushConnectorToken) {
        const socket = new WebSocket(nextRegistration.pushConnectorUrl);
        socketRef.current = socket;
        socket.onopen = () => {
          socket.send(JSON.stringify({ type: 'hand', pushConnectorToken: nextRegistration.pushConnectorToken }));
        };
        socket.onmessage = () => {
          void confirmRegistration(token);
        };
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, err instanceof Error ? err.message : 'Passwordless 등록을 시작하지 못했어요.'));
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async () => {
    setLoading(true);
    setError('');
    setStatus('');
    socketRef.current?.close();

    try {
      const token = await loginForPasswordlessManage();
      await axiosInstance.delete<ApiResponse<null>>('/members/me/passwordless', {
        headers: authHeader(token),
      });
      setAccessToken('');
      setRegistration(null);
      setStatus('Passwordless 등록 해제 완료.');
    } catch (err: unknown) {
      setError(getErrorMessage(err, err instanceof Error ? err.message : 'Passwordless 등록 해제 실패.'));
    } finally {
      setLoading(false);
    }
  };

  const qrSrc = registration?.qr
    ? registration.qr.startsWith('data:') || registration.qr.startsWith('http://') || registration.qr.startsWith('https://')
      ? registration.qr
      : `data:image/png;base64,${registration.qr}`
    : '';

  return (
    <section className={styles.panel} aria-label="Passwordless 등록 및 해지">
      <div className={styles.header}>
        <div>
          <strong>Passwordless 관리</strong>
          <p>이메일/비밀번호 확인 후 QR 등록 또는 해지.</p>
        </div>
        <div className={styles.tabs}>
          <button type="button" className={mode === 'register' ? styles.active : ''} onClick={() => setMode('register')}>
            QR 등록
          </button>
          <button type="button" className={mode === 'withdraw' ? styles.active : ''} onClick={() => setMode('withdraw')}>
            해지
          </button>
        </div>
      </div>

      <div className={styles.fields}>
        <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="이메일" autoComplete="email" />
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호"
          type="password"
          autoComplete="current-password"
        />
      </div>

      {mode === 'register' ? (
        <div className={styles.actions}>
          <button type="button" onClick={() => void startRegistration()} disabled={loading}>
            QR 등록 시작
          </button>
          {registration && (
            <button type="button" onClick={() => void confirmRegistration()} disabled={loading}>
              등록 확인
            </button>
          )}
        </div>
      ) : (
        <div className={styles.actions}>
          <button type="button" onClick={() => void withdraw()} disabled={loading}>
            Passwordless 해지
          </button>
        </div>
      )}

      {qrSrc && (
        <div className={styles.qrBox}>
          <img src={qrSrc} alt="Passwordless 등록 QR" />
          <dl>
            <div>
              <dt>서버 URL</dt>
              <dd>{registration?.serverUrl || '-'}</dd>
            </div>
            <div>
              <dt>등록 키</dt>
              <dd>{registration?.registerKey || '-'}</dd>
            </div>
          </dl>
        </div>
      )}

      {status && <p className={styles.status}>{status}</p>}
      {error && <p className={styles.error}>{error}</p>}
    </section>
  );
};

export default PasswordlessManagePanel;
