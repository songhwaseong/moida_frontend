import React from 'react';
import styles from './LeaveConfirmModal.module.css';

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

const LeaveConfirmModal: React.FC<Props> = ({
  onConfirm,
  onCancel,
  message = '입력한 내용이 저장되지 않아요.\n정말 나가시겠어요?',
  confirmLabel = '나가기',
  cancelLabel = '계속 작성하기',
}) => {
  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <svg width="32" height="32" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <p className={styles.message}>
          {message.split('\n').map((line, i) => (
            <React.Fragment key={i}>{line}{i < message.split('\n').length - 1 && <br />}</React.Fragment>
          ))}
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>{cancelLabel}</button>
          <button className={styles.confirmBtn} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default LeaveConfirmModal;
