import React, { useState } from 'react';
import styles from './SellNoticeModal.module.css';

interface Props {
  onConfirm: (dontShowAgain: boolean) => void;
  onCancel: () => void;
}

const SellNoticeModal: React.FC<Props> = ({ onConfirm, onCancel }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>상품 등록 전 확인해주세요</h2>
        <p className={styles.desc}>
          상품을 먼저 발송한 뒤 택배사와 송장번호를 입력해야 등록할 수 있습니다.
          송장번호가 허위이거나 확인되지 않으면 등록이 반려될 수 있습니다.
        </p>

        <div className={styles.noticeBox}>
          <p className={styles.noticeTitle}>환수 요청 가능</p>
          <p className={styles.noticeText}>
            승인요청중, 경매예정, 유찰 상태에서는 판매자가 상품 돌려받기를 요청할 수 있어요.
          </p>
        </div>

        <div className={styles.noticeBox}>
          <p className={styles.noticeTitle}>환수 요청 불가</p>
          <p className={styles.noticeText}>
            경매중, 낙찰 이후, 반송중, 환수완료 상태에서는 판매자 단순 변심으로 환수할 수 없어요.
          </p>
        </div>

        <p className={styles.footnote}>
          환수 요청은 관리자 확인 후 반송 절차로 진행됩니다.
        </p>

        <label className={styles.checkRow}>
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
          />
          <span>다시 보지 않기</span>
        </label>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>취소</button>
          <button className={styles.confirmBtn} onClick={() => onConfirm(dontShowAgain)}>
            확인하고 등록하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellNoticeModal;
