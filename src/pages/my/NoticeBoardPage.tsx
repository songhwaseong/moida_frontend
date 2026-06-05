import React, { useEffect, useState } from 'react';
import { getNotices, getNotice, type NoticeDto, type NoticeCategory } from '../../api/notices';
import styles from './MySubPage.module.css';

const CATEGORY_COLOR: Record<NoticeCategory, string> = {
  '서비스': '#EEF2FF',
  '이벤트': '#FFF3E0',
  '점검': '#FDEEED',
  '정책': '#EAF3DE',
};

const CATEGORIES: NoticeCategory[] = ['서비스', '이벤트', '점검', '정책'];

interface Props {
  onBack: () => void;
  initialNoticeId?: number;
}

const NoticeBoardPage: React.FC<Props> = ({ onBack, initialNoticeId }) => {
  const [notices, setNotices] = useState<NoticeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<NoticeDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<NoticeCategory | null>(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        if (!initialNoticeId) {
          setSelected(null);
        }
        const data = await getNotices();
        if (alive) setNotices(data);
        if (alive && initialNoticeId) {
          try {
            const detail = await getNotice(initialNoticeId);
            if (!alive) return;
            setSelected(detail);
            setNotices((prev) => prev.map((n) => n.id === detail.id ? detail : n));
          } catch {
            const fallback = data.find((notice) => notice.id === initialNoticeId);
            if (fallback) setSelected(fallback);
          }
        }
      } catch {
        if (alive) setError('공지사항을 불러오지 못했습니다.');
      } finally {
        if (alive) setLoading(false);
      }
    };
    void load();
    return () => { alive = false; };
  }, [initialNoticeId]);

  const filtered = activeCategory ? notices.filter((n) => n.category === activeCategory) : notices;

  const openDetail = async (notice: NoticeDto) => {
    setDetailLoading(true);
    try {
      const detail = await getNotice(notice.id);
      setSelected(detail);
      setNotices((prev) => prev.map((n) => n.id === detail.id ? detail : n));
    } catch {
      setSelected(notice);
    } finally {
      setDetailLoading(false);
    }
  };

  if (selected) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => setSelected(null)} type="button">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <span className={styles.title}>공지사항</span>
          <div style={{ width: 32 }} />
        </div>
        <div className={styles.noticeDetail}>
          <div className={styles.noticeDetailMetaRow}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: CATEGORY_COLOR[selected.category] ?? '#F0F1F4', color: '#444',
            }}>
              {selected.category}
            </span>
            {selected.isPinned && <span style={{ fontSize: 11, color: '#888' }}>📌 고정</span>}
          </div>
          <h2 className={styles.noticeDetailTitle}>{selected.title}</h2>
          <p className={styles.noticeDetailInfo}>
            {selected.author} · {selected.createdAt} · 조회 {selected.viewCount}
          </p>
          <div className={styles.noticeDetailContent}>
            {selected.content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack} type="button">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
        </button>
        <span className={styles.title}>공지사항</span>
        <div style={{ width: 32 }} />
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeCategory === null ? styles.tabActive : ''}`}
          onClick={() => setActiveCategory(null)}
          type="button"
        >
          전체
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`${styles.tab} ${activeCategory === cat ? styles.tabActive : ''}`}
            onClick={() => setActiveCategory(cat)}
            type="button"
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <p className={styles.faqA}>불러오는 중입니다.</p>}
      {!loading && error && <p className={styles.faqA}>{error}</p>}
      {!loading && !error && filtered.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyText}>등록된 공지사항이 없습니다.</p>
        </div>
      )}

      {!loading && !error && filtered.map((notice) => (
        <div key={notice.id} className={styles.faqItem}>
          <button className={styles.faqQ} onClick={() => { void openDetail(notice); }} type="button" disabled={detailLoading}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                  background: CATEGORY_COLOR[notice.category] ?? '#F0F1F4', color: '#444',
                }}>
                  {notice.category}
                </span>
                {notice.isPinned && <span style={{ fontSize: 11 }}>📌</span>}
              </div>
              <span className={styles.faqQText}>{notice.title}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                {notice.createdAt} · 조회 {notice.viewCount}
              </span>
            </div>
            <span className={styles.faqArrow}>›</span>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NoticeBoardPage;
