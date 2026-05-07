import React, { useState } from 'react';
import s from './admin.module.css';

interface Faq {
  id: number;
  category: 'FAQ' | string;
  question: string;
  answer: string;
  order: number;
  visible: boolean;
}

interface Inquiry {
  id: number;
  memberId: string;
  name: string;
  email: string;
  category: '결제' | '경매' | '계정' | '기타';
  title: string;
  content: string;
  status: '답변대기' | '답변완료' | '처리중';
  createdAt: string;
  answer?: string;
  answeredAt?: string;
}

const FAQ_CATEGORIES = ['거래/배송', '경매', '결제', '계정', '신고/제재'];

const INITIAL_FAQS: Faq[] = [
  { id: 1,  category: '거래/배송', question: '거래 후 취소는 어떻게 하나요?',               answer: '거래 전 취소는 마이페이지 > 거래내역에서 가능합니다. 거래 완료 후에는 취소가 불가하며, 문제 발생 시 고객센터로 문의해주세요.',                      order: 1, visible: true },
  { id: 2,  category: '거래/배송', question: '배송 추적은 어디서 확인하나요?',               answer: '마이페이지 > 배송조회에서 실시간 배송 현황을 확인할 수 있습니다. 운송장 번호는 판매자가 발송 처리 시 자동으로 입력됩니다.',                          order: 2, visible: true },
  { id: 3,  category: '경매',      question: '경매 입찰 후 취소가 가능한가요?',               answer: '경매 입찰 후에는 취소가 불가합니다. 낙찰 이후 구매를 거부할 경우 불이익이 발생할 수 있으니 신중하게 입찰해주세요.',                                  order: 1, visible: true },
  { id: 4,  category: '경매',      question: '경매 낙찰 후 결제 기한은 얼마나 되나요?',       answer: '낙찰 후 24시간 이내에 결제를 완료해야 합니다. 기한 내 미결제 시 낙찰이 취소되고 입찰 제한 페널티가 부과됩니다.',                                   order: 2, visible: true },
  { id: 5,  category: '결제',      question: '사용 가능한 결제 수단은 무엇인가요?',           answer: '신용/체크카드, 카카오페이, 네이버페이, 계좌이체를 지원합니다. 직거래의 경우 현금 거래도 가능합니다.',                                               order: 1, visible: true },
  { id: 6,  category: '계정',      question: '탈퇴 후 재가입이 가능한가요?',                 answer: '탈퇴 후 30일이 경과하면 동일 이메일로 재가입이 가능합니다. 단, 이전 거래 내역 및 매너온도는 복구되지 않습니다.',                                     order: 1, visible: true },
  { id: 7,  category: '신고/제재', question: '가품 판매자를 신고하려면 어떻게 하나요?',       answer: '상품 상세 페이지 또는 채팅방에서 신고하기 버튼을 누르면 신고 접수가 가능합니다. 증거자료(사진, 대화 내역)를 첨부해주시면 빠른 처리가 가능합니다.',     order: 1, visible: true },
  { id: 8,  category: '거래/배송', question: '판매자가 발송을 안 해요. 어떻게 하나요?',       answer: '결제 후 3영업일이 지나도 발송이 없다면 채팅으로 문의하시고, 해결되지 않으면 고객센터에 신고해주세요. 확인 후 환불 조치가 이루어집니다.',               order: 3, visible: true },
  { id: 9,  category: '경매',      question: '즉시낙찰가로 구매하면 어떻게 되나요?',           answer: '즉시낙찰가 입찰 즉시 경매가 종료되고 해당 금액으로 낙찰 처리됩니다. 이후 일반 낙찰과 동일하게 24시간 내 결제를 완료해야 합니다.',                   order: 3, visible: true },
  { id: 10, category: '결제',      question: '결제 후 환불은 가능한가요?',                   answer: '상품 수령 전이라면 판매자 동의 하에 취소가 가능합니다. 수령 후 환불은 상품에 중대한 하자가 있는 경우에만 고객센터를 통해 진행할 수 있습니다.',          order: 2, visible: true },
  { id: 11, category: '계정',      question: '비밀번호를 잊어버렸어요.',                     answer: '로그인 화면에서 "비밀번호 찾기"를 눌러 가입 이메일로 재설정 링크를 받으실 수 있습니다. 메일이 오지 않는다면 스팸함을 확인해주세요.',                    order: 2, visible: true },
  { id: 12, category: '신고/제재', question: '허위 후기를 신고할 수 있나요?',                 answer: '거래 후기 페이지에서 해당 후기의 신고 버튼을 누르면 접수됩니다. 거래 내역이 없는 허위 후기는 검토 후 삭제 조치됩니다.',                              order: 2, visible: true },
  { id: 13, category: '거래/배송', question: '직거래도 가능한가요?',                         answer: '직거래는 양 당사자 합의 하에 가능하지만, 플랫폼 보호를 받으려면 앱 내 채팅과 결제를 이용하는 것을 권장합니다.',                                       order: 4, visible: true },
  { id: 14, category: '결제',      question: '포인트는 어디서 확인하고 사용하나요?',           answer: '마이페이지 > 포인트 메뉴에서 잔액을 확인하고 결제 시 사용할 수 있습니다. 포인트는 1포인트 = 1원으로 전액 차감 가능합니다.',                           order: 3, visible: true },
  { id: 15, category: '경매',      question: '경매 시작 전에 입찰을 예약할 수 있나요?',         answer: '현재 경매 예약 입찰 기능은 지원하지 않습니다. 경매 시작 후 직접 입찰해주세요. 향후 업데이트를 통해 알림 기능이 제공될 예정입니다.',                  order: 4, visible: false },
  { id: 16, category: '계정',      question: '이메일 수신 알림을 끄고 싶어요.',               answer: '마이페이지 > 설정 > 알림 설정에서 이메일 및 푸시 알림을 개별적으로 설정할 수 있습니다.',                                                           order: 3, visible: true },
  { id: 17, category: '신고/제재', question: '계정이 정지됐어요. 어떻게 해제하나요?',           answer: '정지 기간 중에는 이용이 제한됩니다. 정지 사유와 기간은 가입 이메일로 발송됩니다. 부당한 조치라 판단되면 고객센터에 이의를 제기하실 수 있습니다.',       order: 3, visible: true },
];

const INITIAL_INQUIRIES: Inquiry[] = [
  { id: 1,  memberId: '2024031500001', name: '박지영', email: 'jiyoung@email.com',  category: '결제', title: '판매자가 배송을 안 보내요',            content: '입금한 지 3일이 지났는데 배송이 안 왔습니다. 환불 받을 수 있나요?',           status: '답변완료', createdAt: '2026.04.28 14:22', answer: '안녕하세요. 확인 결과 판매자에게 경고 조치 후 환불 처리를 도와드렸습니다.', answeredAt: '2026.04.28 16:30' },
  { id: 2,  memberId: '2024040100009', name: '임채원', email: 'chaewon@email.com',  category: '경매', title: '낙찰됐는데 결제 버튼이 안 눌려요',    content: '낙찰 알림을 받았는데 결제 버튼이 비활성화되어 있습니다.',                      status: '처리중',   createdAt: '2026.04.29 09:11' },
  { id: 3,  memberId: '2024062000022', name: '권나영', email: 'nayoung@email.com',  category: '결제', title: '카드 결제가 계속 실패해요',           content: 'PG사 오류인지 결제가 3번 연속 실패합니다. 카드사 확인해도 문제없다고 합니다.',  status: '답변대기', createdAt: '2026.04.29 11:40' },
  { id: 4,  memberId: '2024070100025', name: '백승우', email: 'seungwoo@email.com', category: '계정', title: '비밀번호 찾기 메일이 안 와요',        content: '비밀번호 찾기를 눌렀는데 이메일이 오지 않습니다. 스팸함도 확인했습니다.',       status: '답변대기', createdAt: '2026.04.29 13:22' },
  { id: 5,  memberId: '2024081200038', name: '정수민', email: 'sumin@email.com',    category: '기타', title: '앱 다크모드 지원 요청',              content: '다크모드가 없어서 밤에 쓰기 불편합니다. 추가해주세요!',                         status: '답변완료', createdAt: '2026.04.27 20:00', answer: '소중한 의견 감사합니다. 다크모드는 6월 업데이트에서 제공 예정입니다.', answeredAt: '2026.04.28 09:00' },
  { id: 6,  memberId: '2024031500002', name: '이영희', email: 'younghee@email.com', category: '경매', title: '경매 중 앱이 종료됐어요. 입찰이 취소되나요?', content: '경매 입찰 중 앱이 강제 종료됐습니다. 제 입찰은 유효한가요?',                  status: '답변완료', createdAt: '2026.04.27 10:15', answer: '앱 종료와 무관하게 서버에 기록된 입찰은 유효합니다. 마이페이지에서 확인해주세요.', answeredAt: '2026.04.27 11:00' },
  { id: 7,  memberId: '2024091500037', name: '박지영2', email: 'jiyoung2@email.com', category: '결제', title: '포인트가 결제에 적용이 안 돼요',    content: '보유 포인트가 있는데 결제 페이지에 적용되지 않습니다.',                         status: '처리중',   createdAt: '2026.04.26 16:33' },
  { id: 8,  memberId: '2024050100011', name: '정수민2', email: 'sumin2@email.com',   category: '기타', title: '판매 상품 등록 가이드가 없어요',    content: '처음 판매하려는데 어디서 어떻게 등록하는지 모르겠습니다. 가이드가 있나요?',       status: '답변완료', createdAt: '2026.04.25 09:50', answer: '마이페이지 > 판매내역 > 상품 등록 버튼을 눌러주세요. 가이드는 도움말에서 확인하실 수 있습니다.', answeredAt: '2026.04.25 11:00' },
  { id: 9,  memberId: '2024110100046', name: '권나영2', email: 'nayoung2@email.com', category: '계정', title: '탈퇴 후 데이터는 어떻게 되나요?',   content: '탈퇴하면 제 거래 내역이나 후기는 어떻게 처리되나요?',                           status: '답변대기', createdAt: '2026.04.24 21:00' },
  { id: 10, memberId: '2024080100028', name: '송하은',  email: 'haeun@email.com',    category: '경매', title: '즉시낙찰가가 갑자기 변경됐어요',    content: '즐겨찾기한 경매의 즉시낙찰가가 어제와 달라졌습니다. 판매자가 변경할 수 있나요?',  status: '답변대기', createdAt: '2026.04.24 14:10' },
  { id: 11, memberId: '2024070100025', name: '임채원2', email: 'chaewon2@email.com', category: '결제', title: '부분 환불이 가능한가요?',           content: '여러 상품을 묶음 결제했는데 일부만 환불하고 싶습니다.',                         status: '답변대기', createdAt: '2026.04.23 18:40' },
  { id: 12, memberId: '2024062000022', name: '한지훈',  email: 'jihoon@email.com',   category: '기타', title: '매너온도가 갑자기 낮아졌어요',      content: '최근 거래를 잘 완료했는데 매너온도가 오히려 낮아졌습니다. 이유가 무엇인가요?',   status: '처리중',   createdAt: '2026.04.22 11:25' },
  { id: 13, memberId: '2024031500001', name: '김철수',  email: 'chulsoo@email.com',  category: '경매', title: '경매 종료 직전에 입찰이 안 됩니다',  content: '경매 종료 1분 전에 입찰을 시도했는데 "시간 초과"가 떴습니다.',                  status: '답변완료', createdAt: '2026.04.21 22:05', answer: '경매 종료 30초 전부터는 안정적인 낙찰을 위해 입찰이 제한됩니다. 양해 부탁드립니다.', answeredAt: '2026.04.22 09:00' },
  { id: 14, memberId: '2024100100041', name: '스니커즈1', email: 'sneakers1@email.com', category: '계정', title: '계정이 정지됐는데 이유를 모르겠어요', content: '갑자기 계정이 정지됐습니다. 위반한 게 없는 것 같은데 어떻게 확인하나요?',       status: '처리중',   createdAt: '2026.04.20 08:30' },
  { id: 15, memberId: '2024050100011', name: '정수민3', email: 'sumin3@email.com',   category: '기타', title: '알림이 너무 많이 와요',             content: '하루에 알림이 수십 번 옵니다. 경매 알림만 받고 싶은데 설정 방법을 알려주세요.',  status: '답변완료', createdAt: '2026.04.19 14:55', answer: '마이페이지 > 설정 > 알림에서 항목별로 켜고 끌 수 있습니다. 경매 알림만 남기고 나머지를 끄시면 됩니다.', answeredAt: '2026.04.19 16:00' },
];

const PAGE_SIZE = 5;

const InquiryPage: React.FC = () => {
  const [tab, setTab] = useState<'inquiry' | 'faq'>('inquiry');

  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [faqs, setFaqs] = useState<Faq[]>(INITIAL_FAQS);
  const [filterStatus, setFilterStatus] = useState('전체');
  const [filterCat, setFilterCat] = useState('전체');
  const [faqCat, setFaqCat] = useState('전체');
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [editFaq, setEditFaq] = useState<Faq | null>(null);
  const [faqForm, setFaqForm] = useState<Partial<Faq>>({});
  const [isNewFaq, setIsNewFaq] = useState(false);
  const [inquiryPage, setInquiryPage] = useState(1);
  const [faqPage, setFaqPage] = useState(1);

  const filteredInquiries = inquiries.filter(i => {
    if (filterStatus !== '전체' && i.status !== filterStatus) return false;
    if (filterCat !== '전체' && i.category !== filterCat) return false;
    return true;
  });

  const filteredFaqs = faqs
    .filter(f => faqCat === '전체' || f.category === faqCat)
    .sort((a, b) => a.order - b.order);

  const inquiryTotalPages = Math.ceil(filteredInquiries.length / PAGE_SIZE);
  const pagedInquiries = filteredInquiries.slice((inquiryPage - 1) * PAGE_SIZE, inquiryPage * PAGE_SIZE);

  const faqTotalPages = Math.ceil(filteredFaqs.length / PAGE_SIZE);
  const pagedFaqs = filteredFaqs.slice((faqPage - 1) * PAGE_SIZE, faqPage * PAGE_SIZE);

  const submitAnswer = () => {
    if (!selected || !answerText.trim()) return;
    setInquiries(prev => prev.map(i => i.id === selected.id
      ? { ...i, status: '답변완료', answer: answerText, answeredAt: '2026.05.01 00:00' }
      : i
    ));
    setSelected(null);
    setAnswerText('');
  };

  const openFaqEdit = (f: Faq) => {
    setFaqForm({ ...f });
    setEditFaq(f);
    setIsNewFaq(true);
  };

  const openFaqNew = () => {
    setFaqForm({ category: FAQ_CATEGORIES[0], question: '', answer: '', order: faqs.length + 1, visible: true });
    setEditFaq(null);
    setIsNewFaq(true);
  };

  const saveFaq = () => {
    if (!faqForm.question?.trim() || !faqForm.answer?.trim()) return;
    if (editFaq) {
      setFaqs(prev => prev.map(f => f.id === editFaq.id ? { ...f, ...faqForm } as Faq : f));
    } else {
      const newId = Math.max(...faqs.map(f => f.id)) + 1;
      setFaqs(prev => [...prev, { id: newId, category: faqForm.category ?? FAQ_CATEGORIES[0], question: faqForm.question!, answer: faqForm.answer!, order: faqForm.order ?? faqs.length + 1, visible: faqForm.visible ?? true }]);
    }
    setIsNewFaq(false);
  };

  const statusColor: Record<Inquiry['status'], string> = { '답변대기': '#C62828', '처리중': '#E65C00', '답변완료': '#2E7D32' };
  const statusBg:    Record<Inquiry['status'], string> = { '답변대기': '#FDEEED', '처리중': '#FFF3E0', '답변완료': '#EAF7EC' };

  const pendingCount = inquiries.filter(i => i.status === '답변대기').length;

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>FAQ / 고객문의 관리</div>
        <div className={s.subtitle}>FAQ를 관리하고 고객 문의에 답변합니다.</div>
      </div>

      {/* 요약 */}
      <div className={s.statRow} style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumRed}`}>{pendingCount}<span style={{ fontSize: 14 }}>건</span></div>
          <div className={s.statLabel}>답변 대기</div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumAmber}`}>{inquiries.filter(i => i.status === '처리중').length}<span style={{ fontSize: 14 }}>건</span></div>
          <div className={s.statLabel}>처리 중</div>
        </div>
        <div className={s.statCard}>
          <div className={`${s.statNum} ${s.statNumGreen}`}>{inquiries.filter(i => i.status === '답변완료').length}<span style={{ fontSize: 14 }}>건</span></div>
          <div className={s.statLabel}>답변 완료</div>
        </div>
      </div>

      {/* 탭 */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid #E8E8EF' }}>
        {(['inquiry', 'faq'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '10px 20px', fontWeight: tab === t ? 700 : 500, fontSize: 14, color: tab === t ? '#E24B4A' : '#8B8FA8', background: 'none', border: 'none', borderBottom: tab === t ? '2px solid #E24B4A' : '2px solid transparent', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', marginBottom: -2 }}>
            {t === 'inquiry' ? `고객 문의${pendingCount > 0 ? ` (${pendingCount})` : ''}` : 'FAQ 관리'}
          </button>
        ))}
      </div>

      {/* 고객 문의 탭 */}
      {tab === 'inquiry' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setInquiryPage(1); }}
              style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 110 }}
            >
              {['전체', '답변대기', '처리중', '답변완료'].map(v => <option key={v}>{v}</option>)}
            </select>
            <select
              value={filterCat}
              onChange={e => { setFilterCat(e.target.value); setInquiryPage(1); }}
              style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 110 }}
            >
              {['전체', '결제', '경매', '계정', '기타'].map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
          <table className={s.table}>
            <thead>
              <tr><th>제목</th><th>회원번호</th><th>작성자</th><th>이메일</th><th>상태</th><th>접수일</th><th>관리</th></tr>
            </thead>
            <tbody>
              {filteredInquiries.length === 0
                ? <tr><td colSpan={7} className={s.emptyText}>문의가 없습니다.</td></tr>
                : pagedInquiries.map(i => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 600, cursor: 'pointer', color: '#1A1A2E' }} onClick={() => { setSelected(i); setAnswerText(i.answer ?? ''); }}>{i.title}</td>
                    <td style={{ fontSize: 12, color: '#8B8FA8', fontFamily: 'monospace' }}>{i.memberId}</td>
                    <td>{i.name}</td>
                    <td style={{ fontSize: 12, color: '#8B8FA8' }}>{i.email}</td>
                    <td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 20, background: statusBg[i.status], color: statusColor[i.status] }}>{i.status}</span></td>
                    <td style={{ fontSize: 12, color: '#8B8FA8' }}>{i.createdAt}</td>
                    <td>
                      <button className={s.actionBtn} onClick={() => { setSelected(i); setAnswerText(i.answer ?? ''); }}>
                        {i.status === '답변완료' ? '답변 보기' : '답변하기'}
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>

          {inquiryTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16 }}>
              <button onClick={() => setInquiryPage(p => Math.max(1, p - 1))} disabled={inquiryPage === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: inquiryPage === 1 ? '#F5F5F5' : '#fff', color: inquiryPage === 1 ? '#ccc' : '#4A4A6A', cursor: inquiryPage === 1 ? 'default' : 'pointer', fontSize: 13 }}>이전</button>
              {Array.from({ length: inquiryTotalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setInquiryPage(n)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: inquiryPage === n ? '#E24B4A' : '#fff', color: inquiryPage === n ? '#fff' : '#4A4A6A', fontWeight: inquiryPage === n ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{n}</button>
              ))}
              <button onClick={() => setInquiryPage(p => Math.min(inquiryTotalPages, p + 1))} disabled={inquiryPage === inquiryTotalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: inquiryPage === inquiryTotalPages ? '#F5F5F5' : '#fff', color: inquiryPage === inquiryTotalPages ? '#ccc' : '#4A4A6A', cursor: inquiryPage === inquiryTotalPages ? 'default' : 'pointer', fontSize: 13 }}>다음</button>
            </div>
          )}
        </>
      )}

      {/* FAQ 탭 */}
      {tab === 'faq' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
            <select
              value={faqCat}
              onChange={e => { setFaqCat(e.target.value); setFaqPage(1); }}
              style={{ padding: '8px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, color: '#4A4A6A', background: '#fff', cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', minWidth: 130 }}
            >
              {['전체', ...FAQ_CATEGORIES].map(v => <option key={v}>{v}</option>)}
            </select>
            <button className={s.actionBtnPrimary} style={{ padding: '8px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif' }} onClick={openFaqNew}>+ FAQ 추가</button>
          </div>
          <table className={s.table}>
            <thead>
              <tr><th>구분</th><th>질문</th><th>노출</th><th>관리</th></tr>
            </thead>
            <tbody>
              {pagedFaqs.map(f => (
                <tr key={f.id}>
                  <td><span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: '#E3F0FF', color: '#1565C0' }}>{f.category}</span></td>
                  <td style={{ fontWeight: 600 }}>{f.question}</td>
                  <td>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={f.visible} onChange={() => setFaqs(prev => prev.map(x => x.id === f.id ? { ...x, visible: !x.visible } : x))} />
                      <span style={{ fontSize: 12, color: f.visible ? '#2E7D32' : '#8B8FA8' }}>{f.visible ? '노출' : '숨김'}</span>
                    </label>
                  </td>
                  <td>
                    <button className={s.actionBtn} onClick={() => openFaqEdit(f)}>수정</button>
                    <button className={`${s.actionBtn} ${s.actionBtnDanger}`} onClick={() => setFaqs(prev => prev.filter(x => x.id !== f.id))}>삭제</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {faqTotalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16 }}>
              <button onClick={() => setFaqPage(p => Math.max(1, p - 1))} disabled={faqPage === 1} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: faqPage === 1 ? '#F5F5F5' : '#fff', color: faqPage === 1 ? '#ccc' : '#4A4A6A', cursor: faqPage === 1 ? 'default' : 'pointer', fontSize: 13 }}>이전</button>
              {Array.from({ length: faqTotalPages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setFaqPage(n)} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: faqPage === n ? '#E24B4A' : '#fff', color: faqPage === n ? '#fff' : '#4A4A6A', fontWeight: faqPage === n ? 700 : 400, cursor: 'pointer', fontSize: 13 }}>{n}</button>
              ))}
              <button onClick={() => setFaqPage(p => Math.min(faqTotalPages, p + 1))} disabled={faqPage === faqTotalPages} style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #E0E0E0', background: faqPage === faqTotalPages ? '#F5F5F5' : '#fff', color: faqPage === faqTotalPages ? '#ccc' : '#4A4A6A', cursor: faqPage === faqTotalPages ? 'default' : 'pointer', fontSize: 13 }}>다음</button>
            </div>
          )}
        </>
      )}

      {/* 문의 답변 모달 */}
      {selected && (
        <div className={s.overlay} onClick={() => setSelected(null)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <div className={s.modalTitle}>{selected.title}</div>
              <button className={s.modalClose} onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className={s.infoRow}><div className={s.infoLabel}>작성자</div><div className={s.infoValue}>{selected.name} ({selected.email})</div></div>
            <div className={s.infoRow}><div className={s.infoLabel}>접수일</div><div className={s.infoValue}>{selected.createdAt}</div></div>
            <div className={s.divider} />
            <div style={{ fontSize: 14, lineHeight: 1.7, color: '#2A2A3A', marginBottom: 16 }}>{selected.content}</div>
            <div className={s.divider} />
            <div style={{ fontSize: 13, fontWeight: 600, color: '#4A4A6A', marginBottom: 8 }}>
              {selected.status === '답변완료' ? `✅ 답변 완료 (${selected.answeredAt})` : '📝 답변 작성'}
            </div>
            <textarea className={s.textArea} rows={5} value={answerText} onChange={e => setAnswerText(e.target.value)} placeholder="답변 내용을 입력하세요" readOnly={selected.status === '답변완료'} style={{ background: selected.status === '답변완료' ? '#F8F9FB' : '#fff' }} />
            {selected.status !== '답변완료' && (
              <div className={s.modalActions}>
                <button className={s.actionBtn} onClick={() => { setInquiries(prev => prev.map(i => i.id === selected.id ? { ...i, status: '처리중' } : i)); setSelected(null); }}>처리중으로 변경</button>
                <button className={s.actionBtnPrimary} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif' }} onClick={submitAnswer}>답변 전송</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FAQ 수정/추가 모달 */}
      {isNewFaq && (
        <div className={s.overlay} onClick={() => setIsNewFaq(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHeader}>
              <div className={s.modalTitle}>{editFaq ? 'FAQ 수정' : 'FAQ 추가'}</div>
              <button className={s.modalClose} onClick={() => setIsNewFaq(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>구분</label>
                <select style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif' }}
                  value={faqForm.category} onChange={e => setFaqForm(p => ({ ...p, category: e.target.value }))}>
                  {FAQ_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>질문</label>
                <input style={{ width: '100%', padding: '9px 12px', border: '1px solid #E0E0E0', borderRadius: 8, fontSize: 13, fontFamily: 'Noto Sans KR, sans-serif', boxSizing: 'border-box' }}
                  value={faqForm.question ?? ''} onChange={e => setFaqForm(p => ({ ...p, question: e.target.value }))} placeholder="질문을 입력하세요" />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: '#8B8FA8', display: 'block', marginBottom: 4 }}>답변</label>
                <textarea className={s.textArea} rows={5} value={faqForm.answer ?? ''} onChange={e => setFaqForm(p => ({ ...p, answer: e.target.value }))} placeholder="답변을 입력하세요" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="faqVisible" checked={faqForm.visible ?? true} onChange={e => setFaqForm(p => ({ ...p, visible: e.target.checked }))} />
                <label htmlFor="faqVisible" style={{ fontSize: 13, cursor: 'pointer' }}>노출</label>
              </div>
            </div>
            <div className={s.modalActions}>
              <button className={s.actionBtn} onClick={() => setIsNewFaq(false)}>취소</button>
              <button className={s.actionBtnPrimary} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'Noto Sans KR, sans-serif' }} onClick={saveFaq}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryPage;
