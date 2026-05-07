import React, { useState } from 'react';
import styles from './GuidePage.module.css';

interface Props { onBack: () => void; }

type GuideTab = '구매' | '판매' | '경매';

const GUIDES: Record<GuideTab, { steps: { icon: string; title: string; desc: string }[]; tips: { emoji: string; text: string }[] }> = {
  구매: {
    steps: [
      { icon: '🔍', title: '상품 탐색', desc: '검색 또는 카테고리에서 원하는 상품을 찾아보세요. 상품 상태, 가격, 위치를 꼼꼼히 확인하세요.' },
      { icon: '💬', title: '판매자 채팅', desc: '궁금한 점은 채팅으로 문의해보세요. 직거래 장소, 추가 사진 요청 등을 협의할 수 있어요.' },
      { icon: '💳', title: '안전결제', desc: 'BAZAR 안전결제를 이용하면 대금을 안전하게 보호받을 수 있어요. 직거래 시에는 현장에서 확인 후 결제하세요.' },
      { icon: '📦', title: '상품 수령', desc: '상품을 수령한 후 이상이 없는지 꼭 확인하세요. 문제가 있다면 즉시 판매자 또는 고객센터에 연락하세요.' },
      { icon: '👍', title: '후기 작성', desc: '거래 완료 후 후기를 남겨주세요. 좋은 후기는 판매자에게 큰 힘이 됩니다!' },
    ],
    tips: [
      { emoji: '✅', text: '직거래는 공공장소에서 진행하세요' },
      { emoji: '✅', text: '상품 상태를 사진으로 꼭 확인하세요' },
      { emoji: '✅', text: '가격 흥정은 채팅으로 정중하게 해보세요' },
      { emoji: '⚠️', text: '계좌 직접 송금 후 잠수는 사기 의심!' },
      { emoji: '⚠️', text: '비정상적으로 저렴한 상품은 주의하세요' },
    ],
  },
  판매: {
    steps: [
      { icon: '📸', title: '사진 촬영', desc: '상품의 정면·측면·하자 부분을 밝은 곳에서 촬영하세요. 좋은 사진이 빠른 판매를 만들어요.' },
      { icon: '✏️', title: '상품 등록', desc: '카테고리, 상태, 가격을 정확히 입력하세요. 경매 시작가와 최소 호가 단위도 설정할 수 있어요.' },
      { icon: '💬', title: '구매자 응대', desc: '문의 채팅에 빠르게 답변할수록 판매 성사율이 높아져요. 친절한 응대가 좋은 후기로 이어져요.' },
      { icon: '🤝', title: '거래 확정', desc: '거래 장소와 시간을 확정하세요. 직거래 시 현장 확인 후 거래를 완료해주세요.' },
      { icon: '💰', title: '수익 출금', desc: '판매 수익은 내 계좌에 쌓여요. 등록된 계좌로 언제든 출금 신청이 가능해요.' },
    ],
    tips: [
      { emoji: '✅', text: '상품 설명은 최대한 자세하게 작성하세요' },
      { emoji: '✅', text: '시세보다 10~15% 낮게 설정하면 빨리 팔려요' },
      { emoji: '✅', text: '여러 장의 선명한 사진이 판매에 도움돼요' },
      { emoji: '⚠️', text: '허위 상품 설명은 계정 제재 대상이에요' },
      { emoji: '⚠️', text: '거래 완료 전 개인정보 요구는 거절하세요' },
    ],
  },
  경매: {
    steps: [
      { icon: '🔍', title: '경매 탐색', desc: '실시간 경매 목록에서 관심 있는 상품을 찾아보세요. 마감 시간과 현재 입찰가를 확인하세요.' },
      { icon: '💰', title: '잔액 충전', desc: '입찰 전 내 계좌에 충분한 잔액이 있는지 확인하세요. 입찰가보다 보유 잔액이 많아야 입찰할 수 있어요.' },
      { icon: '🔨', title: '입찰 참여', desc: '현재 최고 입찰가보다 높은 금액을 입력하고 입찰 확정을 누르세요. 최소 호가 단위 이상으로 올려야 해요.' },
      { icon: '🏆', title: '낙찰 확인', desc: '경매 종료 시 최고 입찰자가 낙찰돼요. 낙찰 알림을 받으면 판매자와 채팅으로 거래를 이어가세요.' },
      { icon: '📦', title: '대금 지급 및 수령', desc: '낙찰 금액이 잔액에서 차감돼요. 판매자와 협의하여 직거래 또는 택배로 상품을 수령하세요.' },
    ],
    tips: [
      { emoji: '✅', text: '마감 직전 입찰이 가장 유리할 수 있어요' },
      { emoji: '✅', text: '관심 경매를 등록해 알림을 받아보세요' },
      { emoji: '✅', text: '최대 예산을 미리 정하고 입찰에 참여하세요' },
      { emoji: '⚠️', text: '입찰 확정 후에는 취소가 어려울 수 있어요' },
      { emoji: '⚠️', text: '잔액 부족 시 입찰이 불가하니 미리 충전하세요' },
    ],
  },
};

const GuidePage: React.FC<Props> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('구매');
  const guide = GUIDES[activeTab];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.title}>이용 가이드</span>
        <div style={{ width: 32 }}/>
      </div>

      {/* 탭 */}
      <div className={styles.tabs}>
        {(['구매', '판매', '경매'] as GuideTab[]).map(t => (
          <button
            key={t}
            className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t === '구매' ? '🛒 구매' : t === '판매' ? '📦 판매' : '🔨 경매'}
          </button>
        ))}
      </div>

      <div className={styles.scroll}>
        {/* 배너 */}
        <div className={`${styles.banner} ${styles[`banner${activeTab}`]}`}>
          <p className={styles.bannerLabel}>{activeTab} 가이드</p>
          <p className={styles.bannerTitle}>
            {activeTab === '구매' && '안전하고 스마트한 구매'}
            {activeTab === '판매' && '쉽고 빠른 내 물건 판매'}
            {activeTab === '경매' && '짜릿한 경매 낙찰 도전'}
          </p>
          <p className={styles.bannerSub}>
            {activeTab === '구매' && '좋은 물건을 합리적인 가격에 구매하세요'}
            {activeTab === '판매' && '안 쓰는 물건으로 수익을 만들어보세요'}
            {activeTab === '경매' && '시작가부터 시작해 원하는 가격에 낙찰받으세요'}
          </p>
        </div>

        {/* 단계별 안내 */}
        <div className={styles.sectionLabel}>📋 진행 단계</div>
        <div className={styles.stepList}>
          {guide.steps.map((step, i) => (
            <div key={i} className={styles.stepItem}>
              <div className={styles.stepLeft}>
                <div className={styles.stepNumWrap}>
                  <span className={styles.stepNum}>{i + 1}</span>
                  {i < guide.steps.length - 1 && <div className={styles.stepLine}/>}
                </div>
              </div>
              <div className={styles.stepBody}>
                <div className={styles.stepHeader}>
                  <span className={styles.stepIcon}>{step.icon}</span>
                  <span className={styles.stepTitle}>{step.title}</span>
                </div>
                <p className={styles.stepDesc}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 꿀팁 */}
        <div className={styles.sectionLabel}>💡 꿀팁 & 주의사항</div>
        <div className={styles.tipList}>
          {guide.tips.map((tip, i) => (
            <div key={i} className={`${styles.tipItem} ${tip.emoji === '⚠️' ? styles.tipWarn : styles.tipOk}`}>
              <span className={styles.tipEmoji}>{tip.emoji}</span>
              <span className={styles.tipText}>{tip.text}</span>
            </div>
          ))}
        </div>

        {/* 고객센터 안내 */}
        <div className={styles.csBox}>
          <p className={styles.csText}>더 궁금한 점이 있으신가요?</p>
          <p className={styles.csSub}>고객센터 또는 자주 묻는 질문을 이용해보세요</p>
        </div>

        <div style={{ height: 80 }}/>
      </div>
    </div>
  );
};

export default GuidePage;
