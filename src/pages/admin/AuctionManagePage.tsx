import React, { useState } from 'react';
import { AUCTION_ITEMS, AUCTION_DETAILS } from '../../data/mockData';
import styles from './AuctionManagePage.module.css';

type AuctionStatus = '경매중' | '낙찰' | '유찰' | '취소';

interface AuctionRow {
  auctionNo: string;
  id: number;
  name: string;
  category: string;
  currentPrice: number;
  bidCount: number;
  status: AuctionStatus;
  timeLeft: number;
}

const formatTime = (sec: number) => {
  if (sec <= 0) return '종료';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}시간 ${m}분`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
};

const formatPrice = (p: number) => p.toLocaleString('ko-KR') + '원';

const AuctionManagePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const PRESET_STATUS: Record<number, AuctionStatus> = { 2: '낙찰', 5: '낙찰' };

  const [rows, setRows] = useState<AuctionRow[]>(
    AUCTION_ITEMS.map(a => ({
      auctionNo: a.auctionNo,
      id: a.id,
      name: a.name,
      category: a.category,
      currentPrice: a.currentPrice,
      bidCount: a.bidCount,
      status: PRESET_STATUS[a.id] ?? '경매중',
      timeLeft: a.timeLeft,
    }))
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const filtered = rows.filter(r => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return r.auctionNo.toLowerCase().includes(q) || r.name.toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
    setExpandedId(null);
  };

  const changeStatus = (id: number, status: AuctionStatus) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const getBidHistory = (id: number) => {
    return AUCTION_DETAILS.find(d => d.id === id)?.bidHistory ?? [];
  };

  const statusColor: Record<AuctionStatus, string> = {
    '경매중': '#1E88E5',
    '낙찰': '#43A047',
    '유찰': '#FB8C00',
    '취소': '#E53935',
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topBar}>
        <h2 className={styles.title}>경매 관리</h2>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="경매번호(예: A2600001) 또는 상품명 검색"
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>경매번호</th>
              <th>상품명</th>
              <th>카테고리</th>
              <th>현재가</th>
              <th>입찰수</th>
              <th>남은시간</th>
              <th>상태</th>
              <th>입찰내역</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr><td colSpan={8} className={styles.empty}>검색 결과가 없습니다.</td></tr>
            ) : paginated.map(row => (
              <React.Fragment key={row.id}>
                <tr>
                  <td className={styles.auctionNo}>{row.auctionNo}</td>
                  <td className={styles.name}>{row.name}</td>
                  <td>{row.category}</td>
                  <td>{formatPrice(row.currentPrice)}</td>
                  <td>{row.bidCount}회</td>
                  <td>{formatTime(row.timeLeft)}</td>
                  <td>
                    <select
                      className={styles.statusSelect}
                      value={row.status}
                      style={{ color: statusColor[row.status] }}
                      onChange={e => changeStatus(row.id, e.target.value as AuctionStatus)}
                    >
                      <option value="경매중">경매중</option>
                      <option value="낙찰">낙찰</option>
                      <option value="유찰">유찰</option>
                      <option value="취소">취소</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className={styles.bidBtn}
                      onClick={() => setExpandedId(expandedId === row.id ? null : row.id)}
                    >
                      {expandedId === row.id ? '닫기' : '보기'}
                    </button>
                  </td>
                </tr>
                {expandedId === row.id && (
                  <tr>
                    <td colSpan={8} className={styles.bidHistoryCell}>
                      <div className={styles.bidHistory}>
                        <p className={styles.bidHistoryTitle}>입찰 내역 — {row.name}</p>
                        {getBidHistory(row.id).length === 0 ? (
                          <p className={styles.noBid}>입찰 내역이 없습니다.</p>
                        ) : (
                          <table className={styles.bidTable}>
                            <thead>
                              <tr>
                                <th>입찰자</th>
                                <th>회원번호</th>
                                <th>입찰금액</th>
                                <th>시간</th>
                              </tr>
                            </thead>
                            <tbody>
                              {row.status === '낙찰' && (() => {
                                const winner = getBidHistory(row.id)[0];
                                return (
                                  <tr className={styles.winnerRow}>
                                    <td>
                                      <span className={styles.winnerLabel}>🏆 낙찰자</span>
                                      <span className={styles.winnerName}>{winner.user}</span>
                                    </td>
                                    <td className={styles.memberNo}>{winner.memberNo}</td>
                                    <td className={styles.winnerAmount}>{formatPrice(winner.amount)}</td>
                                    <td>{winner.time}</td>
                                  </tr>
                                );
                              })()}
                              {getBidHistory(row.id).map((b, i) => (
                                <tr key={b.id} style={{ background: i === 0 ? '#f0f9f0' : undefined }}>
                                  <td>{b.user}{i === 0 && <span className={styles.winBadge}>최고가</span>}</td>
                                  <td className={styles.memberNo}>{b.memberNo}</td>
                                  <td className={styles.bidAmount}>{formatPrice(b.amount)}</td>
                                  <td>{b.time}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이징 */}
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>총 {filtered.length}건</span>
        <button
          className={styles.pageBtn}
          disabled={page === 1}
          onClick={() => setPage(1)}
        >{'<<'}</button>
        <button
          className={styles.pageBtn}
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
        >{'<'}</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
          <button
            key={p}
            className={`${styles.pageBtn} ${p === page ? styles.pageBtnActive : ''}`}
            onClick={() => setPage(p)}
          >{p}</button>
        ))}
        <button
          className={styles.pageBtn}
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
        >{'>'}</button>
        <button
          className={styles.pageBtn}
          disabled={page === totalPages}
          onClick={() => setPage(totalPages)}
        >{'>>'}</button>
      </div>
    </div>
  );
};

export default AuctionManagePage;
