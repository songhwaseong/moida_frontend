import React, { useState } from 'react';
import styles from '../my/MySubPage.module.css';
import tStyles from './TrackingPage.module.css';

interface Props {
  onBack: () => void;
}

const CARRIERS = [
  { code: 'CJ', name: 'CJ대한통운' },
  { code: 'LOGEN', name: '로젠택배' },
  { code: 'HANJIN', name: '한진택배' },
  { code: 'POST', name: '우체국택배' },
  { code: 'LOTTE', name: '롯데택배' },
  { code: 'KYUNGDONG', name: '경동택배' },
  { code: 'ILYANG', name: '일양로지스' },
  { code: 'EPOST', name: 'EMS' },
];

type StepStatus = 'done' | 'active' | 'pending';

interface TrackingStep {
  time: string;
  location: string;
  status: string;
  stepStatus: StepStatus;
}

interface TrackingResult {
  carrier: string;
  trackingNo: string;
  product: string;
  currentStatus: string;
  estimatedDate: string;
  steps: TrackingStep[];
}

// 택배사별 목업 데이터 생성
const getMockResult = (carrier: string, trackingNo: string): TrackingResult => {
  const carrierName = CARRIERS.find(c => c.code === carrier)?.name ?? carrier;
  const now = new Date();
  const fmt = (d: Date) =>
    `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  const sub = (h: number) => { const d = new Date(now); d.setHours(d.getHours() - h); return d; };

  return {
    carrier: carrierName,
    trackingNo,
    product: '중고 거래 상품',
    currentStatus: '배송 중',
    estimatedDate: (() => { const d = new Date(now); d.setDate(d.getDate()+1); return `${d.getMonth()+1}/${d.getDate()} 중 도착 예정`; })(),
    steps: [
      { time: fmt(sub(0)), location: '서울 송파 배송센터', status: '배송 출발', stepStatus: 'active' },
      { time: fmt(sub(5)), location: '서울 물류센터', status: '간선상차 완료', stepStatus: 'done' },
      { time: fmt(sub(9)), location: '부산 물류센터', status: '간선하차 완료', stepStatus: 'done' },
      { time: fmt(sub(18)), location: '부산 배송센터', status: '집화 완료', stepStatus: 'done' },
      { time: '', location: '', status: '배송 완료', stepStatus: 'pending' },
    ],
  };
};

const TrackingPage: React.FC<Props> = ({ onBack }) => {
  const [carrier, setCarrier] = useState('');
  const [trackingNo, setTrackingNo] = useState('');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!carrier) { setError('택배사를 선택해주세요'); return; }
    if (!trackingNo.trim()) { setError('송장번호를 입력해주세요'); return; }
    if (!/^\d{10,14}$/.test(trackingNo.replace(/-/g, ''))) {
      setError('올바른 송장번호를 입력해주세요 (10~14자리 숫자)');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setResult(getMockResult(carrier, trackingNo));
  };

  const statusIcon: Record<StepStatus, string> = {
    done: '✓',
    active: '●',
    pending: '○',
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
        <span className={styles.title}>배송 조회</span>
        <div style={{ width: 32 }}/>
      </div>

      <div className={tStyles.content}>
        {/* 입력 카드 */}
        <div className={tStyles.card}>
          <p className={tStyles.cardTitle}>택배사 선택</p>
          <div className={tStyles.carrierGrid}>
            {CARRIERS.map(c => (
              <button
                key={c.code}
                className={`${tStyles.carrierBtn} ${carrier === c.code ? tStyles.carrierActive : ''}`}
                onClick={() => { setCarrier(c.code); setError(''); }}
              >
                {c.name}
              </button>
            ))}
          </div>

          <p className={tStyles.cardTitle} style={{ marginTop: 20 }}>송장번호</p>
          <div className={tStyles.inputRow}>
            <input
              className={tStyles.input}
              type="text"
              inputMode="numeric"
              placeholder="송장번호를 입력하세요"
              value={trackingNo}
              onChange={e => { setTrackingNo(e.target.value.replace(/[^0-9-]/g,'')); setError(''); }}
              maxLength={16}
            />
            <button
              className={tStyles.searchBtn}
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? <span className={tStyles.spinner}/> : '조회'}
            </button>
          </div>
          {error && <p className={tStyles.errorMsg}>{error}</p>}
        </div>

        {/* 결과 */}
        {loading && (
          <div className={tStyles.loadingBox}>
            <span className={tStyles.spinnerLg}/>
            <p className={tStyles.loadingText}>배송 정보를 불러오는 중...</p>
          </div>
        )}

        {result && !loading && (
          <div className={tStyles.resultWrap}>
            {/* 현재 상태 배너 */}
            <div className={tStyles.statusBanner}>
              <div className={tStyles.statusIconWrap}>🚚</div>
              <div>
                <p className={tStyles.statusMain}>{result.currentStatus}</p>
                <p className={tStyles.statusSub}>{result.estimatedDate}</p>
              </div>
            </div>

            {/* 정보 요약 */}
            <div className={tStyles.infoCard}>
              <div className={tStyles.infoRow}>
                <span className={tStyles.infoLabel}>택배사</span>
                <span className={tStyles.infoValue}>{result.carrier}</span>
              </div>
              <div className={tStyles.infoDivider}/>
              <div className={tStyles.infoRow}>
                <span className={tStyles.infoLabel}>송장번호</span>
                <span className={tStyles.infoValue}>{result.trackingNo}</span>
              </div>
            </div>

            {/* 배송 단계 타임라인 */}
            <div className={tStyles.timelineCard}>
              <p className={tStyles.timelineTitle}>배송 상세 내역</p>
              <div className={tStyles.timeline}>
                {result.steps.map((step, i) => (
                  <div key={i} className={tStyles.timelineItem}>
                    <div className={tStyles.timelineLeft}>
                      <div className={`${tStyles.dot} ${tStyles[`dot_${step.stepStatus}`]}`}>
                        {statusIcon[step.stepStatus]}
                      </div>
                      {i < result.steps.length - 1 && (
                        <div className={`${tStyles.line} ${step.stepStatus === 'done' ? tStyles.lineDone : ''}`}/>
                      )}
                    </div>
                    <div className={tStyles.timelineBody}>
                      <div className={tStyles.stepRow}>
                        <span className={`${tStyles.stepStatus} ${tStyles[`step_${step.stepStatus}`]}`}>
                          {step.status}
                        </span>
                        {step.time && <span className={tStyles.stepTime}>{step.time}</span>}
                      </div>
                      {step.location && (
                        <p className={tStyles.stepLocation}>📍 {step.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackingPage;
