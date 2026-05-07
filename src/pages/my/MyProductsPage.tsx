import React, { useState } from 'react';
import { myProductStore, deleteMyProduct, updateMyProduct } from '../../data/myProductStore';
import type { MyProduct } from '../../data/myProductStore';
import styles from './MySubPage.module.css';
import editStyles from './MyProductsPage.module.css';
import LeaveConfirmModal from '../../components/LeaveConfirmModal';
import { useToast } from '../../components/Toast';

const TABS = ['전체', '경매예정', '승인요청중', '경매중', '낙찰', '유찰', '숨김'];

interface Props {
  onBack: () => void;
  onEdit: (product: MyProduct) => void;
}

const MyProductsPage: React.FC<Props> = ({ onBack, onEdit }) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState('전체');
  const [, forceUpdate] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<MyProduct | null>(null);
  const [hideTarget, setHideTarget] = useState<MyProduct | null>(null);
  const [approveTarget, setApproveTarget] = useState<MyProduct | null>(null);

  const items = tab === '전체'
    ? myProductStore
    : myProductStore.filter(p => p.status === tab);

  const statusColor = (s: MyProduct['status']) => {
    if (s === '경매예정') return styles.statusOn;
    if (s === '승인요청중') return styles.statusApproving;
    if (s === '경매중') return styles.statusAuctioning;
    if (s === '낙찰') return styles.statusDone;
    if (s === '유찰') return styles.statusFailed;
    return styles.statusHidden;
  };

  const refresh = () => forceUpdate(n => n + 1);

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMyProduct(deleteTarget.id);
    setDeleteTarget(null);
    refresh();
  };

  const handleHide = () => {
    if (!hideTarget) return;
    updateMyProduct({ ...hideTarget, status: '숨김' });
    setHideTarget(null);
    refresh();
    showToast('상품이 숨김 처리됐어요.', 'info');
  };

  const handleApprove = () => {
    if (!approveTarget) return;
    updateMyProduct({ ...approveTarget, status: '승인요청중' });
    setApproveTarget(null);
    refresh();
    showToast('승인 요청이 완료됐어요. 검토 후 경매가 시작돼요.', 'success');
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.title}>내 등록 상품</span>
        <div style={{ width: 32 }}/>
      </div>

      <div className={styles.tabs}>
        {TABS.map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className={styles.list}>
        {items.length > 0 ? items.map(p => (
          <div key={p.id} className={styles.tradeItem}>
            <img src={p.images[p.mainImageIndex] || p.images[0]} alt={p.title} className={styles.tradeImg}/>
            <div className={styles.tradeBody}>
              <p className={styles.tradeName}>{p.title}</p>
              <p className={styles.tradeMeta}>{p.location} · {p.condition} · {p.category}</p>
              <p className={styles.tradePrice}>경매시작가 {p.auctionStartPrice || '—'}</p>
            </div>
            <div className={styles.tradeActions}>
              <span className={`${styles.statusBadge} ${statusColor(p.status)}`}>{p.status}</span>
              <div className={editStyles.btnRow}>
                {(p.status === '숨김' || p.status === '유찰') && (
                  <button className={editStyles.editBtn} onClick={() => onEdit(p)}>수정</button>
                )}
                {p.status === '경매예정' && (
                  <>
                    <button className={editStyles.hideBtn} onClick={() => setHideTarget(p)}>숨김</button>
                    <button className={editStyles.approveBtn} onClick={() => setApproveTarget(p)}>승인요청</button>
                  </>
                )}
                {p.status === '유찰' && (
                  <button className={editStyles.deleteBtn} onClick={() => setDeleteTarget(p)}>삭제</button>
                )}
              </div>
            </div>
          </div>
        )) : (
          <div className={styles.empty}>
            <p style={{ fontSize: 40 }}>📦</p>
            <p className={styles.emptyText}>등록된 상품이 없어요</p>
          </div>
        )}
      </div>

      {deleteTarget && (
        <LeaveConfirmModal
          message={`'${deleteTarget.title}'\n상품을 삭제하시겠어요?`}
          confirmLabel="삭제하기"
          cancelLabel="취소"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {hideTarget && (
        <LeaveConfirmModal
          message={`'${hideTarget.title}'\n상품을 숨김 처리하시겠어요?`}
          confirmLabel="숨김 처리"
          cancelLabel="취소"
          onConfirm={handleHide}
          onCancel={() => setHideTarget(null)}
        />
      )}

      {approveTarget && (
        <LeaveConfirmModal
          message={`'${approveTarget.title}'\n경매 승인을 요청하시겠어요?\n검토 후 경매가 시작돼요.`}
          confirmLabel="승인 요청"
          cancelLabel="취소"
          onConfirm={handleApprove}
          onCancel={() => setApproveTarget(null)}
        />
      )}
    </div>
  );
};

export default MyProductsPage;
