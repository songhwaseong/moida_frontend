import React, { useState, useEffect, useRef } from 'react';
import styles from './MySubPage.module.css';
import modalStyles from './AddressModal.module.css';

interface Address {
  id: number;
  name: string;
  zonecode: string;
  address: string;
  detail: string;
  phone: string;
  isDefault: boolean;
}

const INIT: Address[] = [
  { id:1, name:'집', zonecode:'06236', address:'서울특별시 강남구 테헤란로 123', detail:'101동 1001호', phone:'010-1234-5678', isDefault:true },
  { id:2, name:'회사', zonecode:'03925', address:'서울특별시 마포구 월드컵북로 56', detail:'위워크 5층', phone:'010-9876-5432', isDefault:false },
];

const EMPTY = { id: 0, name: '', zonecode: '', address: '', detail: '', phone: '', isDefault: false };

interface Props { onBack: () => void; }

const AddressPage: React.FC<Props> = ({ onBack }) => {
  const [list, setList] = useState<Address[]>(INIT);
  const [modal, setModal] = useState<Address | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [showPostcode, setShowPostcode] = useState(false);
  const postcodeRef = useRef<HTMLDivElement>(null);

  const openAdd = () => { setIsNew(true); setModal({ ...EMPTY, id: Date.now() }); };
  const openEdit = (a: Address) => { setIsNew(false); setModal({ ...a }); };
  const closeModal = () => { setModal(null); setShowPostcode(false); };

  // 카카오 우편번호 iframe 삽입
  useEffect(() => {
    if (!showPostcode || !postcodeRef.current) return;

    const script = document.createElement('script');
    script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.onload = () => {
      if (!postcodeRef.current) return;
      new (window as any).daum.Postcode({
        oncomplete: (data: any) => {
          setModal(p => p && ({
            ...p,
            zonecode: data.zonecode,
            address: data.roadAddress || data.jibunAddress,
          }));
          setShowPostcode(false);
        },
        width: '100%',
        height: '100%',
      }).embed(postcodeRef.current);
    };
    // 이미 로드된 경우
    if ((window as any).daum?.Postcode) {
      script.onload?.(new Event('load'));
    } else {
      document.head.appendChild(script);
    }
  }, [showPostcode]);

  const handleDelete = (id: number) => {
    setList(prev => {
      const next = prev.filter(a => a.id !== id);
      if (!next.find(a => a.isDefault) && next.length > 0) next[0].isDefault = true;
      return next;
    });
  };

  const handleSetDefault = (id: number) =>
    setList(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));

  const handleSave = () => {
    if (!modal) return;
    if (!modal.name.trim() || !modal.address.trim() || !modal.phone.trim()) {
      alert('이름, 주소, 전화번호를 모두 입력해주세요.');
      return;
    }
    if (isNew) {
      setList(prev => {
        const next = modal.isDefault ? prev.map(a => ({ ...a, isDefault: false })) : prev;
        return [...next, modal];
      });
    } else {
      setList(prev =>
        modal.isDefault
          ? prev.map(a => ({ ...a, isDefault: a.id === modal.id }))
          : prev.map(a => a.id === modal.id ? modal : a)
      );
    }
    closeModal();
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={onBack}>
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <span className={styles.title}>내 주소 관리</span>
        <div style={{width:32}}/>
      </div>

      <div className={styles.list}>
        {list.map(a => (
          <div key={a.id} className={styles.addrItem}>
            <div className={styles.addrHeader}>
              <p className={styles.addrName}>📍 {a.name}</p>
              {a.isDefault && <span className={styles.defaultBadge}>기본 배송지</span>}
            </div>
            {a.zonecode && <p className={styles.addrZonecode}>[{a.zonecode}]</p>}
            <p className={styles.addrText}>{a.address}<br/>{a.detail}</p>
            <p className={styles.addrPhone}>{a.phone}</p>
            <div className={styles.addrBtns}>
              <button className={styles.addrBtn} onClick={() => openEdit(a)}>수정</button>
              <button className={styles.addrBtn} onClick={() => handleDelete(a.id)}>삭제</button>
              {!a.isDefault && (
                <button className={styles.addrBtn} onClick={() => handleSetDefault(a.id)}>
                  기본 배송지 설정
                </button>
              )}
            </div>
          </div>
        ))}
        <button className={styles.addBtn} onClick={openAdd}>+ 새 주소 추가</button>
      </div>

      {modal && (
        <div className={modalStyles.overlay} onClick={closeModal}>
          <div className={modalStyles.modal} onClick={e => e.stopPropagation()}>
            <div className={modalStyles.modalHeader}>
              <h2 className={modalStyles.modalTitle}>{isNew ? '새 주소 추가' : '주소 수정'}</h2>
              <button className={modalStyles.closeBtn} onClick={closeModal}>✕</button>
            </div>

            <div className={modalStyles.fields}>

              {/* 카카오 우편번호 검색 영역 */}
              {showPostcode && (
                <div className={modalStyles.postcodeWrap}>
                  <div className={modalStyles.postcodeHeader}>
                    <span>주소 검색</span>
                    <button className={modalStyles.postcodeClose} onClick={() => setShowPostcode(false)}>✕ 닫기</button>
                  </div>
                  <div ref={postcodeRef} className={modalStyles.postcodeFrame} />
                </div>
              )}

              <div className={modalStyles.field}>
                <label className={modalStyles.label}>이름 (예: 집, 회사)</label>
                <input
                  className={modalStyles.input}
                  placeholder="배송지 이름"
                  value={modal.name}
                  onChange={e => setModal(p => p && ({ ...p, name: e.target.value }))}
                />
              </div>

              <div className={modalStyles.field}>
                <label className={modalStyles.label}>주소</label>
                <div className={modalStyles.addressSearchRow}>
                  <input
                    className={`${modalStyles.input} ${modalStyles.inputReadonly}`}
                    placeholder="아래 버튼으로 주소를 검색하세요"
                    value={modal.zonecode ? `[${modal.zonecode}] ${modal.address}` : modal.address}
                    readOnly
                    onClick={() => setShowPostcode(true)}
                  />
                  <button className={modalStyles.searchBtn} onClick={() => setShowPostcode(true)}>
                    검색
                  </button>
                </div>
              </div>

              <div className={modalStyles.field}>
                <label className={modalStyles.label}>상세 주소</label>
                <input
                  className={modalStyles.input}
                  placeholder="동/호수, 층 등"
                  value={modal.detail}
                  onChange={e => setModal(p => p && ({ ...p, detail: e.target.value }))}
                />
              </div>

              <div className={modalStyles.field}>
                <label className={modalStyles.label}>전화번호</label>
                <input
                  className={modalStyles.input}
                  placeholder="010-0000-0000"
                  value={modal.phone}
                  onChange={e => setModal(p => p && ({ ...p, phone: e.target.value }))}
                />
              </div>

              <label className={modalStyles.checkRow}>
                <input
                  type="checkbox"
                  checked={modal.isDefault}
                  onChange={e => setModal(p => p && ({ ...p, isDefault: e.target.checked }))}
                />
                <span>기본 배송지로 설정</span>
              </label>
            </div>

            <div className={modalStyles.actions}>
              <button className={modalStyles.cancelBtn} onClick={closeModal}>취소</button>
              <button className={modalStyles.saveBtn} onClick={handleSave}>저장</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressPage;
