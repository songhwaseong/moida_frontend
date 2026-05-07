import React, { useState, useRef, useEffect, useCallback } from 'react';
import styles from './View360Modal.module.css';

interface Props {
  images: string[];
  productName: string;
  onClose: () => void;
}

const View360Modal: React.FC<Props> = ({ images, productName, onClose }) => {
  // 이미지가 1장이면 같은 이미지를 36장으로 복제해 프레임처럼 사용
  const frames = images.length < 3
    ? Array.from({ length: 36 }, (_, i) => images[i % images.length])
    : images;

  const total = frames.length;
  const [frameIndex, setFrameIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const startXRef = useRef(0);
  const startFrameRef = useRef(0);
  const lastXRef = useRef(0);
  const velRef = useRef(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);

  // 이미지 프리로드
  useEffect(() => {
    const uniqueUrls = [...new Set(frames)];
    let loaded = 0;
    uniqueUrls.forEach(src => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loaded++;
        if (loaded === uniqueUrls.length) setIsLoaded(true);
      };
      img.src = src;
    });
  }, []);

  // 자동 회전
  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
    setIsAutoPlaying(false);
  }, []);

  const startAuto = useCallback(() => {
    if (autoRef.current) return;
    setIsAutoPlaying(true);
    autoRef.current = setInterval(() => {
      setFrameIndex(p => (p + 1) % total);
    }, 60);
  }, [total]);

  useEffect(() => () => {
    stopAuto();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  // 관성
  const applyInertia = useCallback((vel: number) => {
    if (Math.abs(vel) < 0.3) return;
    const next = vel * 0.88;
    velRef.current = next;
    setFrameIndex(p => {
      const delta = Math.round(vel / 3);
      return ((p - delta) % total + total) % total;
    });
    rafRef.current = requestAnimationFrame(() => applyInertia(next));
  }, [total]);

  // 마우스
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    stopAuto();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setIsDragging(true);
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    startFrameRef.current = frameIndex;
    velRef.current = 0;
  }, [frameIndex, stopAuto]);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    velRef.current = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    const dx = e.clientX - startXRef.current;
    const sensitivity = 200 / total;
    const delta = Math.round(dx / sensitivity);
    setFrameIndex(((startFrameRef.current - delta) % total + total) % total);
  }, [isDragging, total]);

  const onMouseUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    applyInertia(velRef.current);
  }, [isDragging, applyInertia]);

  // 터치
  const onTouchStart = (e: React.TouchEvent) => {
    stopAuto();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startXRef.current = e.touches[0].clientX;
    lastXRef.current = e.touches[0].clientX;
    startFrameRef.current = frameIndex;
    velRef.current = 0;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    velRef.current = e.touches[0].clientX - lastXRef.current;
    lastXRef.current = e.touches[0].clientX;
    const dx = e.touches[0].clientX - startXRef.current;
    const sensitivity = 200 / total;
    const delta = Math.round(dx / sensitivity);
    setFrameIndex(((startFrameRef.current - delta) % total + total) % total);
  };
  const onTouchEnd = () => applyInertia(velRef.current);

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  // 키보드
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft')  { stopAuto(); setFrameIndex(p => (p - 1 + total) % total); }
      if (e.key === 'ArrowRight') { stopAuto(); setFrameIndex(p => (p + 1) % total); }
      if (e.key === 'Escape')     onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, total, stopAuto]);

  const angleDeg = Math.round((frameIndex / total) * 360);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* 헤더 */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.badge360}>360°</span>
            <span className={styles.title}>{productName}</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* 뷰어 */}
        <div
          className={`${styles.viewer} ${isDragging ? styles.grabbing : styles.grab}`}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {!isLoaded ? (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>이미지 준비 중...</p>
            </div>
          ) : (
            <>
              <img
                src={frames[frameIndex]}
                alt={`${productName} frame ${frameIndex}`}
                className={styles.frameImg}
                draggable={false}
              />

              {/* 각도 */}
              <div className={styles.angleDisplay}>{angleDeg}°</div>

              {/* 좌우 화살표 */}
              <button className={`${styles.arrowBtn} ${styles.arrowLeft}`}
                onClick={() => { stopAuto(); setFrameIndex(p => (p - 1 + total) % total); }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <button className={`${styles.arrowBtn} ${styles.arrowRight}`}
                onClick={() => { stopAuto(); setFrameIndex(p => (p + 1) % total); }}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
              </button>

              {/* 드래그 힌트 */}
              <div className={styles.hint}>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M8 12h8M5 9l-3 3 3 3M19 9l3 3-3 3"/>
                </svg>
                좌우로 드래그하여 회전
              </div>
            </>
          )}
        </div>

        {/* 하단 컨트롤 */}
        <div className={styles.controls}>
          {/* 360 프로그레스바 */}
          <div className={styles.progressWrap}>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${(frameIndex / (total - 1)) * 100}%` }} />
              <div className={styles.progressThumb} style={{ left: `${(frameIndex / (total - 1)) * 100}%` }} />
            </div>
            <input
              type="range" min={0} max={total - 1} value={frameIndex}
              onChange={e => { stopAuto(); setFrameIndex(Number(e.target.value)); }}
              className={styles.sliderHidden}
            />
          </div>

          <div className={styles.btns}>
            <button className={styles.ctrlBtn}
              onClick={() => { stopAuto(); setFrameIndex(p => (p - 1 + total) % total); }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
            </button>

            <button
              className={`${styles.autoBtn} ${isAutoPlaying ? styles.autoBtnActive : ''}`}
              onClick={() => isAutoPlaying ? stopAuto() : startAuto()}
            >
              {isAutoPlaying ? '⏸ 정지' : '▶ 자동회전'}
            </button>

            <button className={styles.ctrlBtn}
              onClick={() => { stopAuto(); setFrameIndex(p => (p + 1) % total); }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>

          <p className={styles.keyHint}>← → 키보드 · 드래그 · 터치로 조작</p>
        </div>
      </div>
    </div>
  );
};

export default View360Modal;
