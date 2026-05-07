import React from 'react';
import styles from './AlertModal.module.css';

interface Props {
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void; // 없으면 단순 알럿(버튼 1개)
}

const AlertModal: React.FC<Props> = ({
  message,
  confirmLabel = '로그인하기',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}) => {
  const handleOverlayClick = () => { onCancel ? onCancel() : onConfirm(); };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.iconWrap}>
          <svg width="28" height="28" fill="none" stroke="var(--primary)" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className={styles.message}>
          {message.split('\n').map((line, i, arr) => (
            <React.Fragment key={i}>
              {line}{i < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
        <div className={styles.actions}>
          {onCancel && (
            <button className={styles.cancelBtn} onClick={onCancel}>
              {cancelLabel}
            </button>
          )}
          <button className={styles.confirmBtn} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
