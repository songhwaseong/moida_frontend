import React, { useState, useEffect } from 'react';
import { AUCTION_DETAILS } from '../data/mockData';
import { useInquiries, addInquiry } from '../data/inquiries';
import styles from './AuctionDetailPage.module.css';
import { useToast } from '../components/Toast';
import View360Modal from '../components/View360Modal';

interface Props {
  itemId: number;
  onBack: () => void;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
  onSellerClick?: (seller: { name: string; temp: number; sales: number; location: string }) => void;
}

const AuctionDetailPage: React.FC<Props> = ({ itemId, onBack, isLoggedIn = false, onRequireLogin, onSellerClick }) => {
  const item = AUCTION_DETAILS.find((a) => a.id === itemId) ?? AUCTION_DETAILS[0];

  const [liked, setLiked] = useState(item.liked);
  const [likeCount, setLikeCount] = useState(item.likeCount);
  const [currentPrice, setCurrentPrice] = useState(item.currentPrice);
  const [bidCount, setBidCount] = useState(item.bidCount);
  const [bidInput, setBidInput] = useState('');
  const [showBidHistory, setShowBidHistory] = useState(false);
  const [showBidModal, setShowBidModal] = useState(false);
  const [showInstantModal, setShowInstantModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(item.timeLeft); // 초(seconds)
  const [activeImg, setActiveImg] = useState(0);
  const [show360, setShow360] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'inquiry'>('desc');
  const [showAskModal, setShowAskModal] = useState(false);
  const [newInquiry, setNewInquiry] = useState('');
  const allInquiries = useInquiries();
  const inquiries = allInquiries.filter(q => q.kind === 'auction' && q.itemId === item.id);

  const handleSubmitInquiry = () => {
    const text = newInquiry.trim();
    if (!text) return;
    addInquiry('auction', item.id, '나', text);
    setNewInquiry('');
    setShowAskModal(false);
    setActiveTab('inquiry');
  };

  const { showToast } = useToast();
  const USER_BALANCE = 267000;

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;
  const timeDisplay = h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const isUrgent = timeLeft > 0 && timeLeft < 300;
  const isEnded  = timeLeft <= 0;

  const handleBid = () => {
    const amount = parseInt(bidInput.replace(/,/g, ''), 10);
    if (isNaN(amount) || amount <= currentPrice) {
      showToast(`현재가(${currentPrice.toLocaleString()})보다 높게 입찰하세요`, 'error');
      return;
    }
    if (amount > USER_BALANCE) {
      showToast(`잔액 부족\n보유: ${USER_BALANCE.toLocaleString()} / 입찰: ${amount.toLocaleString()}`, 'error');
      return;
    }
    setCurrentPrice(amount);
    setBidCount((p) => p + 1);
    setBidInput('');
    setShowBidModal(false);
    showToast(`${amount.toLocaleString()} 입찰 완료!`, 'success');
  };


  return (
    <>
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className={styles.headerTitle}>경매 상세</span>
        <button
          className={`${styles.likeBtn} ${liked ? styles.likeBtnActive : ''}`}
          onClick={() => {
            if (!isLoggedIn) { onRequireLogin?.(); return; }
            setLiked(p => !p);
            setLikeCount(p => liked ? p - 1 : p + 1);
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span className={styles.likeBtnCount}>{likeCount}</span>
        </button>
      </div>

      <div className={styles.scroll}>
        <div className={styles.twoCol}>

          {/* ── 왼쪽: 이미지 ── */}
          <div className={styles.imgArea}>
            <div className={styles.mainImg}>
              <img src={item.images[activeImg]} alt={item.name} className={styles.mainImgEl} />
              {item.isLive && (
                <div className={styles.liveBadge}><span className={styles.liveDot} />LIVE</div>
              )}
              {isEnded
                ? <div className={styles.timerBadge}>⏱ 경매 종료</div>
                : <div className={`${styles.timerBadge} ${isUrgent ? styles.urgent : ''}`}>⏱ {timeDisplay}</div>
              }
              <button className={styles.btn360} onClick={() => setShow360(true)}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/>
                </svg>
                360°
              </button>
            </div>
            <div className={styles.thumbRow}>
              {item.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumb} ${activeImg === i ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt="" className={styles.thumbImg} />
                </button>
              ))}
            </div>
          </div>

          {/* ── 오른쪽: 정보 ── */}
          <div className={styles.rightCol}>

            {/* 브레드크럼 */}
            <div className={styles.breadcrumb}>
              <span>홈</span>
              <span>›</span>
              <span>경매</span>
              <span>›</span>
              <strong>{item.category}</strong>
            </div>

            {/* 배지 */}
            <div className={styles.categoryRow}>
              <span className={styles.categoryTag}>{item.category}</span>
              <span className={styles.conditionTag}>{item.condition}</span>
            </div>

            {/* 상품명 */}
            <h1 className={styles.name}>{item.name}</h1>
            <p className={styles.location}>📍 {item.location} · <span className={styles.timeGlow}>{item.endDate} 마감</span></p>

            {/* 가격 + 입찰 박스 */}
            <div className={styles.priceBox}>
              <div className={styles.priceRow}>
                <div>
                  <p className={styles.priceLabel}>현재 최고 입찰가</p>
                  <p className={styles.price}> {currentPrice.toLocaleString()}</p>
                  <p className={styles.startPrice}>시작가 {item.startPrice.toLocaleString()}</p>
                </div>
                <div className={styles.bidStat}>
                  <p className={styles.bidCount}>{bidCount}회</p>
                  <p className={styles.bidLabel}>입찰 횟수</p>
                </div>
              </div>
              {item.immediatePrice && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0 4px', borderTop: '1px dashed #E8E8EF', marginTop: 8 }}>
                  <span style={{ fontSize: 13, color: '#8B8FA8' }}>즉시입찰가</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#E24B4A' }}> {item.immediatePrice.toLocaleString()}</span>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  className={styles.inlineBidBtn}
                  onClick={() => {
                    if (!isLoggedIn) { onRequireLogin?.(); return; }
                    setShowBidModal(true);
                  }}
                  disabled={isEnded}
                >
                  {isEnded ? '경매 종료' : '입찰하기'}
                </button>
                <button
                  className={styles.inlineInstantBtn}
                  onClick={() => {
                    if (!isLoggedIn) { onRequireLogin?.(); return; }
                    setShowInstantModal(true);
                  }}
                  disabled={isEnded || !item.immediatePrice}
                >
                  즉시낙찰
                </button>
              </div>
            </div>

            {/* 입찰 이력 */}
            <button className={styles.historyToggle} onClick={() => setShowBidHistory(p => !p)}>
              입찰 이력 {showBidHistory ? '▲ 접기' : '▼ 보기'}
            </button>
            {showBidHistory && (
              <div className={styles.historyList}>
                {item.bidHistory.map((b, i) => (
                  <div key={b.id} className={styles.historyItem}>
                    <span className={styles.historyRank}>{i + 1}위</span>
                    <span className={styles.historyUser}>{b.memberNo}</span>
                    <span className={styles.historyAmount}>{b.amount.toLocaleString()}</span>
                    <span className={styles.historyTime}>{b.time}</span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.divider} />

            {/* 판매자 */}
            <div className={styles.section}>
              <p className={styles.sectionTitle}>판매자 정보</p>
              <div className={styles.sellerRow}>
                <div className={styles.sellerAvatar}>😊</div>
                <div className={styles.sellerInfo}>
                  <p className={styles.sellerName}>{item.seller}</p>
                  <div className={styles.sellerMeta}>
                    <span className={styles.sellerTemp}>🌡 {item.sellerTemp}°C</span>
                    <span className={styles.sellerSales}>거래 {item.sellerSales}회</span>
                  </div>
                </div>
                <button
                  className={styles.sellerChat}
                  onClick={() => onSellerClick?.({ name: item.seller, temp: item.sellerTemp, sales: item.sellerSales, location: item.location })}
                >프로필</button>
              </div>
            </div>

            <div className={styles.divider} />

            {/* 상품 설명 / 상품 문의 탭 */}
            <div className={styles.section}>
              <div className={styles.tabsRow}>
                <div className={styles.tabs}>
                  <button
                    className={`${styles.tab} ${activeTab === 'desc' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('desc')}
                  >
                    상품 설명
                  </button>
                  <button
                    className={`${styles.tab} ${activeTab === 'inquiry' ? styles.tabActive : ''}`}
                    onClick={() => setActiveTab('inquiry')}
                  >
                    상품 문의
                    <span className={styles.tabCount}>{inquiries.length}</span>
                  </button>
                </div>
                {activeTab === 'inquiry' && (
                  <button className={styles.askBtn} onClick={() => setShowAskModal(true)}>
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                    문의하기
                  </button>
                )}
              </div>

              {activeTab === 'desc' && (
                <p className={styles.description}>{item.description}</p>
              )}

              {activeTab === 'inquiry' && (
                <div className={styles.qnaList}>
                  {inquiries.length === 0 ? (
                    <p className={styles.qnaEmpty}>아직 등록된 문의가 없습니다.</p>
                  ) : inquiries.map(q => (
                    <div key={q.id} className={styles.qnaItem}>
                      <div className={styles.qnaQuestion}>
                        <div className={styles.qnaHead}>
                          <span className={styles.qnaBadgeQ}>Q</span>
                          <span className={styles.qnaUser}>{q.user}</span>
                          <span className={styles.qnaDate}>{q.date}</span>
                        </div>
                        <p className={styles.qnaText}>{q.question}</p>
                      </div>
                      {q.answer && (
                        <div className={styles.qnaAnswer}>
                          <div className={styles.qnaHead}>
                            <span className={styles.qnaBadgeA}>A</span>
                            <span className={styles.qnaUser}>
                              {q.answer.user}
                              <span className={styles.qnaSellerTag}>판매자</span>
                            </span>
                            <span className={styles.qnaDate}>{q.answer.date}</span>
                          </div>
                          <p className={styles.qnaText}>{q.answer.text}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.divider} />

            {/* 거래 정보 */}
            <div className={styles.section}>
              <p className={styles.sectionTitle}>거래 정보</p>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}><span className={styles.infoLabel}>상품번호</span><span className={styles.infoValue} style={{ fontFamily: 'monospace', fontSize: 12 }}>{`26${String(item.id).padStart(5, '0')}`}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>경매번호</span><span className={styles.infoValue}>{item.auctionNo}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>지역</span><span className={styles.infoValue}>{item.location}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>카테고리</span><span className={styles.infoValue}>{item.category}</span></div>
                <div className={styles.infoItem}><span className={styles.infoLabel}>마감일</span><span className={styles.infoValue}>{item.endDate}</span></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 입찰 모달 */}
      {showBidModal && (() => {
        const bidAmount = parseInt(bidInput.replace(/,/g, ''), 10);
        const isInsufficient = !isNaN(bidAmount) && bidAmount > USER_BALANCE;
        const minBid = currentPrice + 1000;
        return (
          <div className={styles.modalOverlay} onClick={() => setShowBidModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <p className={styles.modalTitle}>입찰가 입력</p>
              <p className={styles.modalSub}>최소 입찰가: {minBid.toLocaleString()}</p>
              <div className={styles.balanceRow}>
                <span className={styles.balanceLabel}>보유 잔액</span>
                <span className={`${styles.balanceValue} ${isInsufficient ? styles.balanceInsufficient : ''}`}>
                  {USER_BALANCE.toLocaleString()}
                </span>
              </div>
              <input
                className={`${styles.modalInput} ${isInsufficient ? styles.modalInputError : ''}`}
                type="number"
                placeholder={` ${minBid.toLocaleString()} 이상`}
                value={bidInput}
                onChange={e => setBidInput(e.target.value)}
                autoFocus
              />
              {isInsufficient && (
                <p className={styles.insufficientMsg}>
                  잔액이 부족해요. {(bidAmount - USER_BALANCE).toLocaleString()} 더 필요해요
                </p>
              )}
              <div className={styles.modalBtns}>
                <button className={styles.modalCancel} onClick={() => setShowBidModal(false)}>취소</button>
                <button
                  className={styles.modalConfirm}
                  onClick={handleBid}
                  disabled={isInsufficient}
                  style={isInsufficient ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                >입찰 확정</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 즉시낙찰 모달 */}
      {showInstantModal && item.immediatePrice && (() => {
        const isInsufficient = USER_BALANCE < item.immediatePrice;
        return (
          <div className={styles.modalOverlay} onClick={() => setShowInstantModal(false)}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
              <p className={styles.modalTitle}>즉시낙찰</p>
              <p className={styles.modalSub}>아래 금액으로 즉시 낙찰됩니다.</p>
              <div className={styles.balanceRow}>
                <span className={styles.balanceLabel}>보유 잔액</span>
                <span className={`${styles.balanceValue} ${isInsufficient ? styles.balanceInsufficient : ''}`}>
                  {USER_BALANCE.toLocaleString()}
                </span>
              </div>
              <input
                className={`${styles.modalInput} ${isInsufficient ? styles.modalInputError : ''}`}
                type="text"
                value={` ${item.immediatePrice.toLocaleString()}`}
                readOnly
              />
              {isInsufficient && (
                <p className={styles.insufficientMsg}>
                  잔액이 부족해요. {(item.immediatePrice - USER_BALANCE).toLocaleString()} 더 필요해요
                </p>
              )}
              <div className={styles.modalBtns}>
                <button className={styles.modalCancel} onClick={() => setShowInstantModal(false)}>취소</button>
                <button
                  className={styles.modalConfirm}
                  onClick={() => {
                    setCurrentPrice(item.immediatePrice!);
                    setBidCount(p => p + 1);
                    setShowInstantModal(false);
                    showToast(`${item.immediatePrice!.toLocaleString()} 즉시낙찰 완료!`, 'success');
                  }}
                  disabled={isInsufficient}
                  style={isInsufficient ? { opacity: 0.4, cursor: 'not-allowed' } : {}}
                >낙찰 확정</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
    {show360 && (
      <View360Modal
        images={item.images}
        productName={item.name}
        onClose={() => setShow360(false)}
      />
    )}
    {showAskModal && (
      <div className={styles.askOverlay} onClick={() => setShowAskModal(false)}>
        <div className={styles.askModal} onClick={e => e.stopPropagation()}>
          <div className={styles.askModalHead}>
            <span className={styles.askModalTitle}>상품 문의하기</span>
            <button className={styles.askModalClose} onClick={() => setShowAskModal(false)}>✕</button>
          </div>
          <textarea
            className={styles.askTextarea}
            value={newInquiry}
            onChange={e => setNewInquiry(e.target.value)}
            placeholder="궁금한 점을 작성해주세요. 판매자가 확인 후 답변드립니다."
            autoFocus
          />
          <div className={styles.askActions}>
            <button className={styles.askCancel} onClick={() => setShowAskModal(false)}>취소</button>
            <button className={styles.askSubmit} onClick={handleSubmitInquiry} disabled={!newInquiry.trim()}>등록</button>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default AuctionDetailPage;
