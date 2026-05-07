import React, { useMemo, useState } from 'react';
import s from './admin.module.css';
import { useInquiries, setAnswer, type InquiryRecord, type InquiryKind } from '../../data/inquiries';

type StatusFilter = '전체' | '미답변' | '답변완료';
type KindFilter = '전체' | InquiryKind;

const KIND_LABEL: Record<InquiryKind, string> = { product: '경매예정', auction: '경매' };

const InquiryProductPage: React.FC = () => {
  const inquiries = useInquiries();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('전체');
  const [kindFilter, setKindFilter] = useState<KindFilter>('전체');
  const [keyword, setKeyword] = useState('');
  const [target, setTarget] = useState<InquiryRecord | null>(null);
  const [answerText, setAnswerText] = useState('');

  const pendingCount = inquiries.filter(i => !i.answer).length;
  const doneCount = inquiries.length - pendingCount;

  const filtered = useMemo(() => {
    return inquiries.filter(i => {
      if (statusFilter === '미답변' && i.answer) return false;
      if (statusFilter === '답변완료' && !i.answer) return false;
      if (kindFilter !== '전체' && i.kind !== kindFilter) return false;
      if (keyword.trim()) {
        const k = keyword.trim().toLowerCase();
        if (!i.itemName.toLowerCase().includes(k)
          && !i.question.toLowerCase().includes(k)
          && !i.user.toLowerCase().includes(k)) return false;
      }
      return true;
    });
  }, [inquiries, statusFilter, kindFilter, keyword]);

  const openAnswer = (rec: InquiryRecord) => {
    setTarget(rec);
    setAnswerText(rec.answer?.text ?? '');
  };

  const submitAnswer = () => {
    if (!target) return;
    const text = answerText.trim();
    if (!text) return;
    setAnswer(target.id, text);
    setTarget(null);
    setAnswerText('');
  };

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>상품 문의 관리</div>
        <div className={s.subtitle}>일반상품/경매 상세에 등록된 사용자 문의에 답변합니다.</div>
      </div>

      {/* 요약 */}
      <div className={s.statRow} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className={s.statCard}>
          <div className={s.statNum}>{inquiries.length}<span style={{ fontSize: 14 }}>건</span></div>
          <div className={s.statLabel}>전체 문의</div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumRed}`}>{pendingCount}<span style={{ fontSize: 14 }}>건</span></div>
          <div className={s.statLabel}>답변 대기</div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumGreen}`}>{doneCount}<span style={{ fontSize: 14 }}>건</span></div>
          <div className={s.statLabel}>답변 완료</div>
        </div>
      </div>

      {/* 필터 */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid #E8E8EF' }}>
          {(['전체', '미답변', '답변완료'] as StatusFilter[]).map(t => (
            <button
              key={t}
              onClick={() => setStatusFilter(t)}
              style={{
                padding: '10px 18px', fontWeight: statusFilter === t ? 700 : 500, fontSize: 14,
                color: statusFilter === t ? '#E24B4A' : '#8B8FA8',
                background: 'none', border: 'none',
                borderBottom: statusFilter === t ? '2px solid #E24B4A' : '2px solid transparent',
                cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', marginBottom: -2,
              }}
            >
              {t}
              {t === '미답변' && pendingCount > 0 && (
                <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 700, color: '#E24B4A', background: '#FDEEED', padding: '1px 7px', borderRadius: 10 }}>
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <select
          value={kindFilter}
          onChange={e => setKindFilter(e.target.value as KindFilter)}
          style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 110, marginLeft: 'auto' }}
        >
          <option value="전체">전체 종류</option>
          <option value="product">경매예정</option>
          <option value="auction">경매</option>
        </select>
        <input
          type="text"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          placeholder="상품명 / 작성자 / 질문 검색"
          style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 220 }}
        />
      </div>

      {/* 문의 목록 */}
      {filtered.length === 0 ? (
        <div className={s.emptyText} style={{ padding: 40, background: '#fff', border: '1px solid #EDEEF2', borderRadius: 12, textAlign: 'center', color: '#8B8FA8', fontSize: 13 }}>
          조건에 맞는 문의가 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(q => (
            <div key={q.id} style={{ border: '1px solid #EDEEF2', borderRadius: 12, background: '#fff', overflow: 'hidden' }}>
              {/* 상단: 상품 정보 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid #F2F3F6', background: '#FAFAFB' }}>
                {q.itemImage && (
                  <img src={q.itemImage} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 4,
                      background: q.kind === 'auction' ? '#FFF3E0' : '#EAF7EC',
                      color: q.kind === 'auction' ? '#A06200' : '#256B30',
                    }}>{KIND_LABEL[q.kind]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.itemName}
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#8B8FA8' }}>판매자 {q.seller}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                  background: q.answer ? '#EAF7EC' : '#FDEEED',
                  color: q.answer ? '#256B30' : '#A32D2D',
                }}>
                  {q.answer ? '답변완료' : '답변대기'}
                </span>
                <button className={`${s.actionBtn} ${!q.answer ? s.actionBtnPrimary : ''}`} onClick={() => openAnswer(q)}>
                  {q.answer ? '답변 수정' : '답변 작성'}
                </button>
              </div>

              {/* 질문 */}
              <div style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 5, background: '#1A1A2E', color: '#fff', fontSize: 11, fontWeight: 800 }}>Q</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E' }}>{q.user}</span>
                  <span style={{ fontSize: 12, color: '#8B8FA8', marginLeft: 'auto' }}>{q.date}</span>
                </div>
                <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#1A1A2E', whiteSpace: 'pre-line', margin: 0 }}>{q.question}</p>
              </div>

              {/* 답변 */}
              {q.answer && (
                <div style={{ padding: '14px 16px', background: '#FAFAFB', borderTop: '1px dashed #EDEEF2' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 5, background: '#E24B4A', color: '#fff', fontSize: 11, fontWeight: 800 }}>A</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A2E', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {q.answer.user}
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#E24B4A', background: 'rgba(226,75,74,0.10)', padding: '1px 6px', borderRadius: 4 }}>판매자</span>
                    </span>
                    <span style={{ fontSize: 12, color: '#8B8FA8', marginLeft: 'auto' }}>{q.answer.date}</span>
                  </div>
                  <p style={{ fontSize: 13.5, lineHeight: 1.7, color: '#1A1A2E', whiteSpace: 'pre-line', margin: 0 }}>{q.answer.text}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 답변 모달 */}
      {target && (
        <div className={s.overlay} onClick={() => setTarget(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()} style={{ maxWidth: 560 }}>
            <div className={s.modalHeader}>
              <div className={s.modalTitle}>{target.answer ? '답변 수정' : '답변 작성'}</div>
              <button className={s.modalClose} onClick={() => setTarget(null)}>✕</button>
            </div>

            <div style={{ background: '#FAFAFB', border: '1px solid #EDEEF2', borderRadius: 10, padding: 14, margin: '14px 0' }}>
              <div style={{ fontSize: 11, color: '#8B8FA8', marginBottom: 6 }}>
                {KIND_LABEL[target.kind]} · {target.itemName}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 18, height: 18, borderRadius: 4, background: '#1A1A2E', color: '#fff', fontSize: 10, fontWeight: 800 }}>Q</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A2E' }}>{target.user}</span>
                <span style={{ fontSize: 11, color: '#8B8FA8', marginLeft: 'auto' }}>{target.date}</span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: '#1A1A2E', whiteSpace: 'pre-line', margin: 0 }}>{target.question}</p>
            </div>

            <textarea
              value={answerText}
              onChange={e => setAnswerText(e.target.value)}
              placeholder="답변 내용을 입력해주세요"
              autoFocus
              style={{
                width: '100%', minHeight: 140, boxSizing: 'border-box',
                border: '1px solid #E0E0E0', borderRadius: 10, padding: 12,
                fontSize: 13.5, lineHeight: 1.6, color: '#1A1A2E',
                fontFamily: 'Noto Sans KR, sans-serif', resize: 'vertical', outline: 'none',
              }}
            />

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
              <button className={s.actionBtn} onClick={() => setTarget(null)}>취소</button>
              <button
                className={`${s.actionBtn} ${s.actionBtnPrimary}`}
                onClick={submitAnswer}
                disabled={!answerText.trim()}
                style={!answerText.trim() ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
              >
                {target.answer ? '수정 완료' : '답변 등록'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryProductPage;
