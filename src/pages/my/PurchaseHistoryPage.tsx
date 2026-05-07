import React, { useState } from 'react';
import { PRODUCTS } from '../../data/mockData';
import { addReview } from '../../data/reviewStore';
import { useToast } from '../../components/Toast';
import styles from './MySubPage.module.css';
import modalStyles from './ReviewModal.module.css';

const TABS = ['구매완료', '진행중'];
interface Props { onBack: () => void; }

const PurchaseHistoryPage: React.FC<Props> = ({ onBack }) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState('구매완료');
  const items = tab === '구매완료' ? PRODUCTS.slice(0, 3) : PRODUCTS.slice(3);

  const ThumbUp = ({ filled }: { filled: boolean }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z"/>
      <path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/>
    </svg>
  );

  const [reviewedIds, setReviewedIds] = useState<number[]>([]);
  const [modalProduct, setModalProduct] = useState<{ id: number; name: string } | null>(null);
  const [stars, setStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const openModal = (id: number, name: string) => {
    setModalProduct({ id, name });
    setStars(0); setHoverStar(0); setReviewText(''); setSubmitted(false);
  };
  const closeModal = () => setModalProduct(null);

  const handleSubmit = () => {
    if (stars === 0) { showToast('평가를 선택해주세요', 'warning'); return; }
    if (reviewText.trim().length < 10) { showToast('후기를 10자 이상 입력해주세요', 'warning'); return; }
    const today = new Date();
    const date = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;
    addReview({ user: '홍길동', date, stars, text: reviewText.trim(), product: modalProduct!.name });
    setSubmitted(true);
    setReviewedIds(prev => [...prev, modalProduct!.id]);
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span className={styles.title}>구매 내역</span>
        <div style={{width:32}}/>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => <button key={t} className={`${styles.tab} ${tab===t?styles.tabActive:''}`} onClick={()=>setTab(t)}>{t}</button>)}
      </div>

      <div className={styles.list}>
        {items.length > 0 ? items.map(p => (
          <div key={p.id} className={styles.tradeItem}>
            <img src={p.image} alt={p.name} className={styles.tradeImg}/>
            <div className={styles.tradeBody}>
              <p className={styles.tradeName}>{p.name}</p>
              <p className={styles.tradeMeta}>{p.location} · {p.timeAgo}</p>
              <p className={styles.tradePrice}> {p.price.toLocaleString()}</p>
            </div>
            <div className={styles.tradeActions}>
              <span className={`${styles.statusBadge} ${tab==='진행중'?styles.statusOn:styles.statusDone}`}>
                {tab==='진행중'?'진행중':'완료'}
              </span>
              {tab==='구매완료' && (
                reviewedIds.includes(p.id)
                  ? <span className={styles.reviewDone}>후기완료 ✓</span>
                  : <button className={styles.reviewBtn} onClick={()=>openModal(p.id, p.name)}>후기 작성</button>
              )}
            </div>
          </div>
        )) : (
          <div className={styles.empty}>
            <p style={{fontSize:40}}>🛒</p>
            <p className={styles.emptyText}>{tab} 내역이 없어요</p>
          </div>
        )}
      </div>

      {modalProduct && (
        <div className={modalStyles.overlay} onClick={closeModal}>
          <div className={modalStyles.modal} onClick={e=>e.stopPropagation()}>
            {!submitted ? (
              <>
                <p className={modalStyles.title}>후기 작성</p>
                <p className={modalStyles.productName}>📦 {modalProduct.name}</p>
                <div className={modalStyles.starsRow}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} className={`${modalStyles.starBtn} ${(hoverStar||stars)>=n ? modalStyles.starOn : modalStyles.starOff}`}
                      onMouseEnter={()=>setHoverStar(n)} onMouseLeave={()=>setHoverStar(0)}
                      onClick={()=>setStars(n)}>
                      <ThumbUp filled={(hoverStar||stars)>=n} />
                    </button>
                  ))}
                </div>
                <p className={modalStyles.starLabel}>
                  {[,'별로예요','그저 그래요','보통이에요','좋아요','최고예요! 🎉'][(hoverStar||stars)] ?? '평가를 선택해주세요'}
                </p>
                <textarea
                  className={modalStyles.textarea}
                  placeholder="거래는 어떠셨나요? 자세한 후기를 남겨주세요 (최소 10자)"
                  value={reviewText}
                  onChange={e=>setReviewText(e.target.value)}
                  maxLength={300} rows={4}
                />
                <p className={modalStyles.charCount}>{reviewText.length}/300</p>
                <div className={modalStyles.btns}>
                  <button className={modalStyles.cancelBtn} onClick={closeModal}>취소</button>
                  <button className={modalStyles.submitBtn} onClick={handleSubmit}
                    disabled={stars===0 || reviewText.trim().length<10}>후기 등록</button>
                </div>
              </>
            ) : (
              <div className={modalStyles.successWrap}>
                <p className={modalStyles.successEmoji}>🎉</p>
                <p className={modalStyles.successTitle}>후기가 등록됐어요!</p>
                <p className={modalStyles.successSub}>소중한 후기 감사해요{'\n'}판매자에게 큰 힘이 됩니다</p>
                <button className={modalStyles.submitBtn} onClick={closeModal}>확인</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistoryPage;
