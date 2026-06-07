import React, { useCallback, useMemo, useState } from 'react';
import styles from './admin.module.css';

type DialogKind = 'alert' | 'confirm' | 'prompt';
type DialogVariant = 'default' | 'danger';

interface DialogState {
  kind: DialogKind;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  placeholder?: string;
  defaultValue: string;
  requiredMessage: string;
  variant: DialogVariant;
  resolve: (value: boolean | string | null) => void;
}

interface BaseOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
}

interface PromptOptions extends BaseOptions {
  placeholder?: string;
  defaultValue?: string;
  requiredMessage?: string;
}

export const useAdminDialog = () => {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  const open = useCallback((next: Omit<DialogState, 'resolve'>) => (
    new Promise<boolean | string | null>((resolve) => {
      setInput(next.defaultValue);
      setError(null);
      setDialog({ ...next, resolve });
    })
  ), []);

  const alert = useCallback(async (message: string, title = '안내') => {
    await open({
      kind: 'alert',
      title,
      message,
      confirmLabel: '확인',
      cancelLabel: '취소',
      defaultValue: '',
      requiredMessage: '',
      variant: 'default',
    });
  }, [open]);

  const confirm = useCallback((options: BaseOptions) => (
    open({
      kind: 'confirm',
      title: options.title ?? '확인',
      message: options.message,
      confirmLabel: options.confirmLabel ?? '확인',
      cancelLabel: options.cancelLabel ?? '취소',
      defaultValue: '',
      requiredMessage: '',
      variant: options.variant ?? 'default',
    }) as Promise<boolean>
  ), [open]);

  const prompt = useCallback((options: PromptOptions) => (
    open({
      kind: 'prompt',
      title: options.title ?? '사유 입력',
      message: options.message,
      confirmLabel: options.confirmLabel ?? '확인',
      cancelLabel: options.cancelLabel ?? '취소',
      placeholder: options.placeholder,
      defaultValue: options.defaultValue ?? '',
      requiredMessage: options.requiredMessage ?? '관리자 처리 사유를 입력해야 합니다.',
      variant: options.variant ?? 'default',
    }) as Promise<string | null>
  ), [open]);

  const close = useCallback((value: boolean | string | null) => {
    dialog?.resolve(value);
    setDialog(null);
    setInput('');
    setError(null);
  }, [dialog]);

  const handleConfirm = useCallback(() => {
    if (!dialog) return;
    if (dialog.kind === 'prompt') {
      const value = input.trim();
      if (!value) {
        setError(dialog.requiredMessage);
        return;
      }
      close(value);
      return;
    }
    close(true);
  }, [close, dialog, input]);

  const handleCancel = useCallback(() => {
    if (!dialog) return;
    close(dialog.kind === 'alert' ? true : null);
  }, [close, dialog]);

  const element = useMemo(() => {
    if (!dialog) return null;
    const confirmClassName = dialog.variant === 'danger' ? styles.actionBtnDanger : styles.actionBtnPrimary;
    return (
      <div className={styles.overlay} onClick={handleCancel}>
        <div className={styles.dialogModal} onClick={event => event.stopPropagation()}>
          <div className={styles.modalHeader}>
            <div className={styles.modalTitle}>{dialog.title}</div>
            <button className={styles.modalClose} onClick={handleCancel}>x</button>
          </div>
          <div className={styles.dialogBody}>
            {dialog.message.split('\n').map((line, index) => (
              <React.Fragment key={`${line}-${index}`}>
                {line}
                {index < dialog.message.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
          {dialog.kind === 'prompt' && (
            <>
              <textarea
                className={styles.dialogInput}
                value={input}
                placeholder={dialog.placeholder}
                onChange={event => {
                  setInput(event.target.value);
                  if (error) setError(null);
                }}
                autoFocus
              />
              {error && <div className={styles.dialogError}>{error}</div>}
            </>
          )}
          <div className={styles.modalActions}>
            {dialog.kind !== 'alert' && (
              <button className={styles.actionBtn} onClick={handleCancel}>
                {dialog.cancelLabel}
              </button>
            )}
            <button className={`${styles.actionBtn} ${confirmClassName}`} onClick={handleConfirm}>
              {dialog.confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }, [dialog, error, handleCancel, handleConfirm, input]);

  return { alert, confirm, prompt, element };
};
