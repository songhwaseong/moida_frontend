import React, { useState } from 'react';
import styles from './MySubPage.module.css';

const FAQS = [
  { q:'경매 입찰 후 취소할 수 있나요?', a:'입찰 확정 후에는 취소가 불가합니다. 단, 경매 종료 전 판매자가 동의하는 경우 취소가 가능할 수 있습니다.' },
  { q:'안전결제는 어떻게 이용하나요?', a:'채팅창에서 "안전결제" 버튼을 눌러 시작할 수 있습니다. 구매자가 결제하면 BAZAR가 대금을 보관하고, 거래 완료 확인 후 판매자에게 지급됩니다.' },
  { q:'직거래 사기를 당했어요', a:'즉시 고객센터에 신고해주세요. 증거 자료(대화 내용, 입금 내역)를 보관하시고, 경찰에도 신고하시길 권고드립니다.' },
  { q:'낙찰 후 판매자가 연락이 안돼요', a:'낙찰 후 24시간 내 판매자 연락이 없을 경우 고객센터로 문의해주세요. 패널티 조치 후 환불 처리해드립니다.' },
  { q:'회원 탈퇴는 어떻게 하나요?', a:'설정 > 회원 탈퇴에서 진행하실 수 있습니다. 탈퇴 시 모든 데이터가 삭제되며 복구가 불가합니다.' },
];

interface Props { onBack: () => void; }

const FaqPage: React.FC<Props> = ({ onBack }) => {
  const [open, setOpen] = useState<number|null>(null);
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button>
        <span className={styles.title}>자주 묻는 질문</span>
        <div style={{width:32}}/>
      </div>
      <div>
        {FAQS.map((f,i) => (
          <div key={i} className={styles.faqItem}>
            <button className={styles.faqQ} onClick={()=>setOpen(open===i?null:i)}>
              <span className={styles.faqQText}>Q. {f.q}</span>
              <span className={`${styles.faqArrow} ${open===i?styles.faqArrowOpen:''}`}>▼</span>
            </button>
            {open===i && <p className={styles.faqA}>A. {f.a}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};
export default FaqPage;
