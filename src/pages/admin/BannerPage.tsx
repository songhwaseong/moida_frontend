import React, { useState, useRef } from 'react';
import s from './admin.module.css';

interface CategoryItem {
  id: number;
  name: string;
  icon: React.ReactNode;
  order: number;
  visible: boolean;
}

const SvgIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" {...p}/>
);

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  '디지털/가전': <SvgIcon><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></SvgIcon>,
  '패션/의류':   <SvgIcon><path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z"/></SvgIcon>,
  '명품':        <SvgIcon><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></SvgIcon>,
  '시계/주얼리': <SvgIcon><circle cx="12" cy="12" r="7"/><path d="M12 9v3l1.5 1.5"/><path d="M9 2h6M9 22h6"/></SvgIcon>,
  '신발':        <SvgIcon><path d="M3 11l5-5 4 4 4-5 5 4v7a1 1 0 01-1 1H4a1 1 0 01-1-1v-5z"/></SvgIcon>,
  '스포츠/레저': <SvgIcon><circle cx="12" cy="12" r="9"/><path d="M12 3c-1.5 3-1.5 6 0 9s1.5 6 0 9"/><path d="M3 12c3-1.5 6-1.5 9 0s6 1.5 9 0"/></SvgIcon>,
  '뷰티/미용':   <SvgIcon><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></SvgIcon>,
  '게임/취미':   <SvgIcon><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><circle cx="15" cy="11" r="1" fill="currentColor"/><circle cx="17" cy="13" r="1" fill="currentColor"/><path d="M3 7h18l-1.5 9.5a2 2 0 01-2 1.5H6.5a2 2 0 01-2-1.5L3 7z"/></SvgIcon>,
  '음향/악기':   <SvgIcon><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></SvgIcon>,
  '한정판':      <SvgIcon><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></SvgIcon>,
  '이월상품':    <SvgIcon><path d="M20 12V22H4V12"/><path d="M22 7H2v5h20V7z"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></SvgIcon>,
};

const INITIAL_CATEGORIES: CategoryItem[] = [
  { id: 1,  name: '디지털/가전',   icon: CATEGORY_ICONS['디지털/가전'], order: 1,  visible: true  },
  { id: 2,  name: '패션/의류',     icon: CATEGORY_ICONS['패션/의류'],   order: 2,  visible: true  },
  { id: 3,  name: '명품',          icon: CATEGORY_ICONS['명품'],        order: 3,  visible: true  },
  { id: 4,  name: '시계/주얼리',   icon: CATEGORY_ICONS['시계/주얼리'], order: 4,  visible: true  },
  { id: 5,  name: '신발',          icon: CATEGORY_ICONS['신발'],        order: 5,  visible: true  },
  { id: 6,  name: '스포츠/레저',   icon: CATEGORY_ICONS['스포츠/레저'], order: 6,  visible: true  },
  { id: 7,  name: '뷰티/미용',     icon: CATEGORY_ICONS['뷰티/미용'],   order: 7,  visible: true  },
  { id: 8,  name: '게임/취미',     icon: CATEGORY_ICONS['게임/취미'],   order: 8,  visible: true  },
  { id: 9,  name: '음향/악기',     icon: CATEGORY_ICONS['음향/악기'],   order: 9,  visible: true  },
  { id: 10, name: '한정판',        icon: CATEGORY_ICONS['한정판'],      order: 10, visible: true  },
  { id: 11, name: '이월상품',      icon: CATEGORY_ICONS['이월상품'],    order: 11, visible: false },
];

const BannerPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const dragIdRef = useRef<number | null>(null);

  const handleDragStart = (id: number) => { dragIdRef.current = id; };

  const handleDrop = (targetId: number) => {
    const fromId = dragIdRef.current;
    if (fromId == null || fromId === targetId) return;
    setCategories(prev => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const fromIdx  = sorted.findIndex(c => c.id === fromId);
      const toIdx    = sorted.findIndex(c => c.id === targetId);
      const reordered = [...sorted];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      return reordered.map((c, i) => ({ ...c, order: i + 1 }));
    });
    dragIdRef.current = null;
    setDragOverId(null);
  };

  const toggleCategoryVisible = (id: number) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, visible: !c.visible } : c));
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);

  return (
    <div className={s.page}>
      <div className={s.header}>
        <div className={s.title}>카테고리 관리</div>
        <div className={s.subtitle}>카테고리 노출 순서와 표시 여부를 관리합니다.</div>
      </div>

      <div style={{ maxWidth: 1040 }}>
      <table className={s.table}>
        <thead>
          <tr><th>순서</th><th>아이콘</th><th>카테고리명</th><th>노출</th><th>순서 변경</th></tr>
        </thead>
        <tbody>
          {sortedCategories.map(c => (
            <tr
              key={c.id}
              draggable
              onDragStart={() => handleDragStart(c.id)}
              onDragOver={e => { e.preventDefault(); setDragOverId(c.id); }}
              onDragLeave={() => setDragOverId(null)}
              onDrop={() => handleDrop(c.id)}
              style={{
                background: dragOverId === c.id ? '#EEF4FF' : undefined,
                borderTop: dragOverId === c.id ? '2px solid #1565C0' : undefined,
                cursor: 'grab',
              }}
            >
              <td style={{ color: '#8B8FA8', fontWeight: 600 }}>{c.order}</td>
              <td style={{ color: '#4A4A6A' }}>{c.icon}</td>
              <td style={{ fontWeight: 600 }}>{c.name}</td>
              <td>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={c.visible} onChange={() => toggleCategoryVisible(c.id)} />
                  <span style={{ fontSize: 12, color: c.visible ? '#2E7D32' : '#8B8FA8' }}>{c.visible ? '노출중' : '숨김'}</span>
                </label>
              </td>
              <td style={{ color: '#B0B4C8', fontSize: 16 }}>⠿</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default BannerPage;
