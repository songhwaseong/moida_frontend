import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  confirmProductReceipt,
  getMyPurchases,
  type PurchaseHistoryDto,
} from '../../api/products';
import { useToast } from '../../components/ToastContext';
import styles from './MySubPage.module.css';

const TABS = ['진행중', '구매완료'] as const;

interface Props { onBack: () => void; }

const isCompleted = (item: PurchaseHistoryDto) =>
  item.deliveryStatus === 'RECEIVED' || item.settlementStatus === 'PAID';

const statusClass = (item: PurchaseHistoryDto) => {
  if (isCompleted(item)) return styles.statusDone;
  if (item.deliveryStatus === 'DELIVERED') return styles.statusBid;
  if (item.deliveryStatus === 'SHIPPING') return styles.statusOn;
  return styles.statusAuctioning;
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== 'object' || error === null) return fallback;
  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === 'string' ? response.data.message : fallback;
};

const PurchaseHistoryPage: React.FC<Props> = ({ onBack }) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState<(typeof TABS)[number]>('진행중');
  const [items, setItems] = useState<PurchaseHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const loadPurchases = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      setItems(await getMyPurchases());
    } catch (loadError) {
      console.error('Failed to load purchase history', loadError);
      setError('구매 내역을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadInitialPurchases = async () => {
      try {
        const data = await getMyPurchases();
        if (!ignore) setItems(data);
      } catch (loadError) {
        console.error('Failed to load purchase history', loadError);
        if (!ignore) setError('구매 내역을 불러오지 못했습니다.');
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    void loadInitialPurchases();

    return () => { ignore = true; };
  }, []);

  const filteredItems = useMemo(
    () => items.filter((item) => (tab === '구매완료' ? isCompleted(item) : !isCompleted(item))),
    [items, tab],
  );

  const handleConfirmReceipt = async (item: PurchaseHistoryDto) => {
    if (!item.canConfirmReceipt) return;
    if (!window.confirm('상품을 정상 수령하셨나요? 확인하면 판매자에게 정산금액이 지급됩니다.')) {
      return;
    }
    setConfirmingId(item.productId);
    try {
      await confirmProductReceipt(item.productId);
      showToast('수령확인이 완료되었습니다. 판매자 정산도 처리됐어요.', 'success');
      await loadPurchases(false);
      setTab('구매완료');
    } catch (confirmError) {
      showToast(getApiErrorMessage(confirmError, '수령확인에 실패했습니다.'), 'error');
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack} aria-label="뒤로가기">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
        </button>
        <span className={styles.title}>구매 내역</span>
        <div style={{ width: 32 }} />
      </div>

      <div className={styles.tabs}>
        {TABS.map((name) => (
          <button
            key={name}
            className={`${styles.tab} ${tab === name ? styles.tabActive : ''}`}
            onClick={() => setTab(name)}
          >
            {name}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {loading ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>구매 내역을 불러오는 중입니다.</p>
          </div>
        ) : error ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>{error}</p>
            <button className={styles.retryBtn} onClick={() => loadPurchases()}>다시 시도</button>
          </div>
        ) : filteredItems.length > 0 ? filteredItems.map((item) => (
          <div key={`${item.auctionId}-${item.productId}`} className={styles.tradeItem}>
            <img src={item.image} alt={item.name} className={styles.tradeImg} />
            <div className={styles.tradeBody}>
              <p className={styles.tradeName}>{item.name}</p>
              <p className={styles.tradeMeta}>
                {item.category} · {item.auctionNo}
              </p>
              <p className={styles.tradePrice}>{item.winningPrice.toLocaleString()}원</p>
              {item.feeAmount != null && item.settledAmount != null && (
                <p className={styles.tradeMeta}>
                  수수료 {item.feeAmount.toLocaleString()}원 · 판매자 정산 {item.settledAmount.toLocaleString()}원
                </p>
              )}
            </div>
            <div className={styles.tradeActions}>
              <span className={`${styles.statusBadge} ${statusClass(item)}`}>
                {item.deliveryStatusLabel}
              </span>
              {item.canConfirmReceipt && (
                <button
                  className={styles.reviewBtn}
                  disabled={confirmingId === item.productId}
                  onClick={() => handleConfirmReceipt(item)}
                >
                  {confirmingId === item.productId ? '처리중' : '수령확인'}
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>{tab} 내역이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaseHistoryPage;
