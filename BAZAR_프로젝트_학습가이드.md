# BAZAR 프로젝트 완전 정복 가이드

> 중고경매 플랫폼 **BAZAR** 프론트엔드 프로젝트의 전체 구조, 기술 스택, 핵심 패턴을 학습용으로 정리한 문서입니다.

---

## 목차

1. [기술 스택](#1-기술-스택)
2. [프로젝트 폴더 구조](#2-프로젝트-폴더-구조)
3. [핵심 개념: 라우팅 방식](#3-핵심-개념-라우팅-방식)
4. [상태 관리 전략](#4-상태-관리-전략)
5. [컴포넌트 설계 원칙](#5-컴포넌트-설계-원칙)
6. [페이지별 상세 설명](#6-페이지별-상세-설명)
7. [공통 컴포넌트 상세](#7-공통-컴포넌트-상세)
8. [데이터 계층](#8-데이터-계층)
9. [CSS 아키텍처](#9-css-아키텍처)
10. [인증 & 권한 시스템](#10-인증--권한-시스템)
11. [주요 기능 구현 패턴](#11-주요-기능-구현-패턴)
12. [타입 시스템](#12-타입-시스템)
13. [학습 포인트 요약](#13-학습-포인트-요약)

---

## 1. 기술 스택

| 분류 | 기술 | 버전 | 역할 |
|------|------|------|------|
| UI 라이브러리 | **React** | 18.2 | 컴포넌트 기반 UI |
| 언어 | **TypeScript** | 5.0 | 정적 타입 체크 |
| 빌드 도구 | **Vite** | 5.1 | 개발 서버 & 번들링 |
| 스타일링 | **CSS Modules** | — | 컴포넌트 스코프 CSS |
| 라우팅 | **커스텀 상태 라우팅** | — | react-router 미사용 |
| 상태 관리 | **useState (로컬)** | — | 전역 상태 라이브러리 미사용 |
| 데이터 | **Mock Data (메모리)** | — | 백엔드 없이 동작 |

### 왜 react-router를 안 쓰나요?

이 프로젝트는 URL 기반 라우팅 대신 **상태(state) 기반 라우팅**을 사용합니다.
URL이 변하지 않고, `App.tsx`의 `screen` 상태값에 따라 어떤 화면을 렌더링할지 결정합니다.

```tsx
// 이런 방식 대신
<Route path="/auction/:id" element={<AuctionDetailPage />} />

// 이렇게 합니다
const [screen, setScreen] = useState<Screen>({ type: 'home' });
// screen.type이 'auctionDetail'이면 AuctionDetailPage를 렌더링
```

**장점:** 설정이 단순하고 모달 느낌의 화면 전환이 자연스럽습니다.
**단점:** 뒤로가기 버튼, URL 공유, 북마크가 동작하지 않습니다.

---

## 2. 프로젝트 폴더 구조

```
src/
├── App.tsx                    ← 앱의 뇌. 모든 화면 전환과 전역 상태 관리
├── main.tsx                   ← React 앱 진입점 (ReactDOM.render)
│
├── types/
│   └── index.ts               ← 전체 프로젝트 공용 TypeScript 타입 정의
│
├── styles/
│   └── global.css             ← CSS 변수, reset, 전역 스타일
│
├── data/
│   ├── mockData.ts            ← 서버 대신 사용하는 가짜 데이터 (상품/경매)
│   ├── myProductStore.ts      ← 내 등록 상품 인메모리 저장소 (CRUD)
│   └── reviewStore.ts         ← 리뷰 데이터 저장소
│
├── components/                ← 여러 페이지에서 재사용되는 공통 컴포넌트
│   ├── PCLayout.tsx           ← 전체 레이아웃 (상단 헤더 + 탭 네비게이션)
│   ├── AlertModal.tsx         ← 확인/취소 알럿 모달
│   ├── LeaveConfirmModal.tsx  ← 페이지 이탈 확인 모달
│   ├── ProductPreviewModal.tsx ← 상품 등록 미리보기 모달
│   ├── View360Modal.tsx       ← 360° 이미지 뷰어 모달
│   ├── AuctionCard.tsx        ← 경매 상품 카드
│   ├── ProductCard.tsx        ← 일반 상품 카드
│   ├── CategoryRow.tsx        ← 카테고리 필터 가로 스크롤
│   ├── SectionHeader.tsx      ← 섹션 제목 + 더보기 버튼
│   ├── Banner.tsx             ← 홈 상단 배너
│   └── Toast.tsx              ← 토스트 알림 (Context 기반)
│
└── pages/                     ← 각 화면(페이지) 컴포넌트
    ├── HomePage.tsx            ← 홈 (실시간경매 캐러셀 + 상품 그리드)
    ├── AuctionListPage.tsx     ← 경매 탭 전체 목록
    ├── AuctionDetailPage.tsx   ← 경매 상세 + 입찰 기능
    ├── ProductDetailPage.tsx   ← 상품 상세 + 360° 뷰어
    ├── SellPage.tsx            ← 상품 등록 (3단계 폼)
    ├── SearchPage.tsx          ← 탐색/검색
    ├── PopularPage.tsx         ← 인기 탭
    ├── WishlistPage.tsx        ← 관심목록
    ├── TradePage.tsx           ← 중고거래 목록
    ├── LoginPage.tsx           ← 로그인
    ├── SignupPage.tsx          ← 회원가입
    ├── ChatPage.tsx            ← 채팅
    ├── NotificationPage.tsx    ← 알림
    ├── MyPage.tsx              ← 마이페이지 메뉴
    └── my/                    ← 마이페이지 하위 메뉴들
        ├── EditProductPage.tsx ← 상품 수정
        ├── MyProductsPage.tsx  ← 내 등록 상품 관리
        ├── AddressPage.tsx     ← 주소 관리
        ├── SalesHistoryPage.tsx
        ├── PurchaseHistoryPage.tsx
        └── ... (기타 설정 페이지들)
```

---

## 3. 핵심 개념: 라우팅 방식

`App.tsx`가 이 프로젝트의 핵심입니다. 화면 전환 로직이 모두 여기 있습니다.

### Screen 타입 - 화면 상태 정의

```tsx
// 가능한 화면들을 유니온 타입으로 정의
type Screen =
  | { type: 'home' }
  | { type: 'auctionDetail'; id: number }   // 경매 상세 (id 포함)
  | { type: 'productDetail'; id: number }   // 상품 상세 (id 포함)
  | { type: 'sellerProfile'; seller: SellerInfo }
  | { type: 'sellPage' }
  | { type: 'navSearch' }
  | { type: 'navNotification' }
  | { type: 'navChat' }
  | { type: 'navMy' }
  | { type: 'myMenu'; menu: MyMenuKey }
  | { type: 'editProfile' };
```

### 화면 전환 방법

```tsx
// 경매 상세로 이동
setScreen({ type: 'auctionDetail', id: item.id });

// 홈으로 이동
setScreen({ type: 'home' });

// 마이페이지 서브메뉴로 이동
setScreen({ type: 'myMenu', menu: '내 등록 상품' });
```

### 렌더링 로직

```tsx
// 화면 상태에 따라 어떤 컴포넌트를 보여줄지 결정
const renderNavPage = () => {
  if (screen.type === 'sellPage')
    return <SellPage onBack={goHome} />;
  if (screen.type === 'auctionDetail')
    return <AuctionDetailPage itemId={screen.id} onBack={goHome} />;
  if (screen.type === 'navMy')
    return <MyPage onLogout={logout} ... />;
  // ...
};
```

---

## 4. 상태 관리 전략

이 프로젝트는 Redux, Zustand 같은 전역 상태 라이브러리를 사용하지 않습니다.
대신 `App.tsx`에 핵심 상태를 모아두고, **Props로 자식에게 전달**하는 방식을 씁니다.

### App.tsx의 전역 상태 목록

```tsx
// 인증 관련
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [isGuest, setIsGuest] = useState(false);       // 비회원 모드
const [authScreen, setAuthScreen] = useState('login');

// 화면 네비게이션
const [screen, setScreen] = useState<Screen>({ type: 'home' });
const [mainTab, setMainTab] = useState<MainTab>('홈');
const [navTab, setNavTab] = useState<NavTab>('home');

// 상품 편집 중인 항목
const [editingProduct, setEditingProduct] = useState<MyProduct | null>(null);

// 폼 이탈 방지
const [formDirty, setFormDirty] = useState(false);
const [pendingNav, setPendingNav] = useState<null | (() => void)>(null);

// 알럿 모달
const [alertMsg, setAlertMsg] = useState<string | null>(null);
const [alertConfirmCb, setAlertConfirmCb] = useState<(() => void) | null>(null);
const [alertCancelCb, setAlertCancelCb] = useState<(() => void) | null>(null);

// 검색
const [searchQuery, setSearchQuery] = useState('');

// 카테고리 필터
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
```

### 로컬 상태 (페이지/컴포넌트 내부)

각 페이지는 자신만의 로컬 상태를 가집니다.

```tsx
// AuctionDetailPage 내부 예시
const [currentPrice, setCurrentPrice] = useState(item.currentPrice);
const [bidCount, setBidCount] = useState(item.bidCount);
const [showBidModal, setShowBidModal] = useState(false);
const [liked, setLiked] = useState(item.liked);
const [activeImg, setActiveImg] = useState(0);
```

---

## 5. 컴포넌트 설계 원칙

### Props 기반 통신

자식 컴포넌트는 부모로부터 데이터와 콜백 함수를 Props로 받습니다.

```tsx
// 부모 (App.tsx)가 자식에게 무엇을 줄지 정의
interface Props {
  onBack: () => void;           // 뒤로가기 콜백
  isLoggedIn?: boolean;         // 로그인 상태
  onRequireLogin?: () => void;  // 로그인 필요 시 호출
  onDirtyChange?: (dirty: boolean) => void; // 폼 변경 감지
}
```

### 단방향 데이터 흐름

```
App.tsx (상태 보유)
  ↓ props
PCLayout (레이아웃)
  ↓ props
각 Page (화면)
  ↓ props
각 Component (UI 조각)
```

자식이 상태를 바꾸려면 부모가 준 **콜백 함수**를 호출합니다.

```tsx
// 자식 컴포넌트가 부모 상태를 바꾸는 방법
<button onClick={() => onBack()}>뒤로</button>
<button onClick={() => onDirtyChange?.(true)}>내용 입력</button>
```

---

## 6. 페이지별 상세 설명

### HomePage.tsx - 홈 화면

**핵심 기능:** 실시간 경매 캐러셀 + 상품 3열 그리드

```tsx
// 캐러셀 핵심 로직
const scrollRef = useRef<HTMLDivElement>(null);
const CARD_WIDTH = 190 + 14; // 카드 너비 + gap

// 화살표 버튼 클릭 시 스크롤
const scroll = (dir: 'left' | 'right') => {
  scrollRef.current?.scrollBy({
    left: dir === 'left' ? -CARD_WIDTH * 3 : CARD_WIDTH * 3,
    behavior: 'smooth'  // 부드러운 스크롤
  });
};

// 화살표 표시 여부 (끝에 도달하면 숨김)
const updateArrows = () => {
  const el = scrollRef.current;
  setCanLeft(el.scrollLeft > 4);
  setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
};
```

**학습 포인트:**
- `useRef`로 DOM 직접 접근
- `scrollBy({ behavior: 'smooth' })`로 부드러운 스크롤
- `scroll` 이벤트 리스너로 버튼 상태 동기화

---

### SellPage.tsx - 상품 등록 (3단계 폼)

**핵심 기능:** 단계별 폼, 이미지 업로드, 이탈 방지, 미리보기

```tsx
type Step = 1 | 2 | 3;
const [step, setStep] = useState<Step>(1);

// 단계별 유효성 검사
const validateStep1 = () => {
  const e: Record<string, string> = {};
  if (images.length === 0) e.images = '이미지를 추가해주세요';
  if (!title.trim()) e.title = '제목을 입력해주세요';
  // ...
  setErrors(e);
  return Object.keys(e).length === 0; // 에러 없으면 true
};

// 이미지 업로드 (FileReader API)
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files ?? []);
  const remaining = 10 - images.length; // 최대 10장
  files.slice(0, remaining).forEach(file => {
    const reader = new FileReader();
    reader.onload = ev =>
      setImages(prev => prev.length < 10
        ? [...prev, ev.target?.result as string]
        : prev
      );
    reader.readAsDataURL(file); // 이미지를 base64로 변환
  });
};
```

**이탈 방지 시스템:**

```tsx
// 변경 여부 감지
const isDirty = images.length > 0 || title !== '' || description !== '' /* ... */;

// 부모(App.tsx)에 dirty 상태 전달
React.useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]);

// 뒤로가기 클릭 시
const handleBack = () => {
  if (isDirty) setShowLeaveConfirm(true); // 컨펌 모달 표시
  else onBack();
};
```

**단계 인디케이터 (클릭으로 이동):**

```tsx
<button
  className={styles.stepDot}
  onClick={() => {
    if (s < step) setStep(s);        // 이미 완료한 단계 → 바로 이동
    else if (s > step) {             // 앞 단계 → 유효성 검사 후 이동
      if (step === 1 && validateStep1()) setStep(2);
    }
  }}
>
```

---

### AuctionDetailPage.tsx - 경매 상세

**핵심 기능:** 실시간 타이머, 입찰 시스템, 이미지 갤러리

```tsx
// 카운트다운 타이머
const [timeLeft, setTimeLeft] = useState(item.timeLeft);

useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 0) { clearInterval(timer); return 0; }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(timer); // 컴포넌트 언마운트 시 정리
}, []);

// 초 → "MM:SS" 형식으로 변환
const formatTime = (s: number) =>
  `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// 긴급 상태 (10분 미만)
const isUrgent = timeLeft > 0 && timeLeft < 600;
```

**입찰 처리:**

```tsx
const handleBid = () => {
  const amount = parseInt(bidInput.replace(/,/g, ''), 10);
  if (isNaN(amount) || amount <= currentPrice) {
    showToast('현재가보다 높은 금액을 입력하세요');
    return;
  }
  // 낙관적 업데이트 (서버 없이 즉시 UI 반영)
  setCurrentPrice(amount);
  setBidCount(p => p + 1);
  setShowBidModal(false);
  showToast('입찰 완료! 🎉');
};
```

---

### ProductDetailPage.tsx - 상품 상세

**핵심 기능:** 2컬럼 레이아웃, 이미지 갤러리, 360° 뷰어 연동

```tsx
// 360° 뷰어 모달 상태
const [show360, setShow360] = useState(false);

// 렌더링
{show360 && (
  <View360Modal
    images={item.images}
    productName={item.name}
    onClose={() => setShow360(false)}
  />
)}
```

---

### View360Modal.tsx - 360° 이미지 뷰어

**핵심 기능:** 드래그로 이미지 프레임 전환, 관성 스크롤, 자동 회전

```tsx
// 마우스 드래그로 프레임 변경
const onMouseMove = useCallback((e: MouseEvent) => {
  if (!isDragging) return;
  velRef.current = e.clientX - lastXRef.current;  // 속도 계산
  lastXRef.current = e.clientX;
  const dx = e.clientX - startXRef.current;
  const sensitivity = 200 / total;  // 이미지 수에 따라 감도 자동 조절
  const delta = Math.round(dx / sensitivity);
  setFrameIndex(((startFrameRef.current - delta) % total + total) % total);
}, [isDragging, total]);

// 관성 (손을 떼면 서서히 멈춤)
const applyInertia = useCallback((vel: number) => {
  if (Math.abs(vel) < 0.3) return;  // 속도가 0에 가까우면 멈춤
  const next = vel * 0.88;          // 감속 계수
  velRef.current = next;
  setFrameIndex(p => ((p - Math.round(vel / 3)) % total + total) % total);
  rafRef.current = requestAnimationFrame(() => applyInertia(next));  // 재귀 호출
}, [total]);

// 이미지가 1장이면 36장으로 복제 (뷰어가 동작하도록)
const frames = images.length < 3
  ? Array.from({ length: 36 }, (_, i) => images[i % images.length])
  : images;
```

**학습 포인트:**
- `requestAnimationFrame`으로 60fps 부드러운 애니메이션
- `useRef`로 렌더링 없이 값 추적 (velRef, startXRef 등)
- `useCallback` + `window.addEventListener`로 전역 마우스 이벤트 처리

---

## 7. 공통 컴포넌트 상세

### PCLayout.tsx - 전체 레이아웃

상단 2줄 헤더 (로고+검색+우측메뉴 / 탭 네비게이션) + 콘텐츠 영역

```tsx
// 구조
<div className={styles.layout}>       {/* 전체 flex column */}
  <header className={styles.header}>  {/* sticky 상단 고정 */}
    <div className={styles.headerInner}>   {/* 로고 + 검색 + 우측 버튼들 */}
    <nav className={styles.tabNav}>        {/* 홈/경매/인기/관심목록/탐색 탭 */}
  </header>
  <main className={styles.main}>     {/* max-width: 1200px 가운데 정렬 */}
    <div className={styles.content}>
      {children}                      {/* 실제 페이지 내용 */}
    </div>
  </main>
</div>
```

### AlertModal.tsx - 알럿/컨펌 모달

```tsx
// 1버튼 알럿으로 사용
<AlertModal
  message="알림 내용"
  onConfirm={() => closeAlert(true)}
/>

// 2버튼 컨펌으로 사용 (onCancel 추가)
<AlertModal
  message="로그인이 필요합니다.\n이동하시겠어요?"
  confirmLabel="로그인하기"
  cancelLabel="취소"
  onConfirm={() => closeAlert(true)}
  onCancel={() => closeAlert(false)}
/>
```

### LeaveConfirmModal.tsx - 이탈 방지 모달

```tsx
// 기본 사용 (상품 등록/수정 이탈)
<LeaveConfirmModal
  onConfirm={() => { setShowLeaveConfirm(false); onBack(); }}
  onCancel={() => setShowLeaveConfirm(false)}
/>

// 커스텀 메시지 사용 (상품 삭제 확인)
<LeaveConfirmModal
  message={`'${product.title}'\n상품을 삭제하시겠어요?`}
  confirmLabel="삭제하기"
  cancelLabel="취소"
  onConfirm={handleDelete}
  onCancel={() => setDeleteTarget(null)}
/>
```

### Toast.tsx - 토스트 알림

**Context API**를 사용해 어느 컴포넌트에서도 토스트를 띄울 수 있습니다.

```tsx
// 1. App.tsx에서 Provider로 감싸기
<ToastProvider>
  {/* 앱 전체 */}
</ToastProvider>

// 2. 어느 컴포넌트에서든 사용
const { showToast } = useToast();
showToast('입찰 완료! 🎉');
showToast('오류가 발생했습니다', 'error');
```

---

## 8. 데이터 계층

### mockData.ts - 가짜 서버 데이터

실제 백엔드 없이 프론트엔드를 개발할 때 쓰는 하드코딩 데이터입니다.

```
CATEGORIES[]      - 카테고리 목록
AUCTION_ITEMS[]   - 경매 목록 (카드용 간단 데이터)
AUCTION_DETAILS[] - 경매 상세 데이터 (1:1 매핑)
PRODUCTS[]        - 상품 목록 (카드용)
PRODUCT_DETAILS[] - 상품 상세 데이터
```

**중요:** 카드용 데이터(목록)와 상세 데이터가 **별도 배열**로 분리되어 있습니다.
같은 id를 가진 항목끼리 매핑됩니다.

```tsx
// 상세 페이지에서 id로 찾기
const item = AUCTION_DETAILS.find(a => a.id === itemId) ?? AUCTION_DETAILS[0];
```

### myProductStore.ts - 인메모리 CRUD

배열을 직접 변형(mutation)해서 상태를 관리하는 단순한 패턴입니다.

```tsx
export const myProductStore: MyProduct[] = [ /* 초기 데이터 */ ];

// 수정
export const updateMyProduct = (updated: MyProduct) => {
  const idx = myProductStore.findIndex(p => p.id === updated.id);
  if (idx !== -1) myProductStore[idx] = updated;
};

// 추가
export const addMyProduct = (product: Omit<MyProduct, 'id'>) => {
  const id = Date.now(); // 타임스탬프를 id로 사용
  myProductStore.unshift({ ...product, id }); // 맨 앞에 추가
  return id;
};

// 삭제
export const deleteMyProduct = (id: number) => {
  const idx = myProductStore.findIndex(p => p.id === id);
  if (idx !== -1) myProductStore.splice(idx, 1);
};
```

> ⚠️ **주의:** 이 방식은 페이지 새로고침 시 초기화됩니다.
> 실제 서비스에서는 API 호출 + localStorage/서버 저장이 필요합니다.

---

## 9. CSS 아키텍처

### CSS Variables (전역 디자인 토큰)

`global.css`에 정의된 변수를 모든 컴포넌트에서 사용합니다.

```css
:root {
  --primary: #E24B4A;        /* 메인 빨간색 */
  --primary-light: #FDEEED;  /* 연한 빨간색 배경 */
  --accent: #BA7517;         /* 강조색 */
  --bg: #F4F5F7;             /* 페이지 배경 */
  --card: #ffffff;           /* 카드 배경 */
  --text: #1A1A1A;           /* 기본 텍스트 */
  --muted: #8B8FA8;          /* 흐린 텍스트 */
  --border: rgba(0,0,0,0.07); /* 테두리 */
  --radius: 14px;            /* 기본 둥근 모서리 */
  --header-height: 104px;    /* 헤더 높이 */
}
```

### CSS Modules

각 컴포넌트/페이지는 `.module.css` 파일을 가집니다.

```tsx
// 1. import
import styles from './ProductCard.module.css';

// 2. 사용
<div className={styles.card}>
  <p className={styles.title}>{product.name}</p>
</div>

// 3. 조건부 클래스
<div className={`${styles.card} ${isActive ? styles.active : ''}`}>

// 4. 빌드 후 클래스명이 해시로 변환됨 → 충돌 없음
// .card → ._card_xk2j9_1
```

### 레이아웃 패턴

**2컬럼 레이아웃 (상품/경매 상세):**
```css
.twoCol {
  display: grid;
  grid-template-columns: 480px 1fr; /* 왼쪽 고정, 오른쪽 나머지 */
  align-items: start;
}

.imgArea {
  position: sticky; /* 스크롤해도 이미지 고정 */
  top: 0;
}
```

**3열 그리드 (상품 목록):**
```css
.productGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3등분 */
  gap: 16px;
}
```

---

## 10. 인증 & 권한 시스템

### 상태 구조

```tsx
const [isLoggedIn, setIsLoggedIn] = useState(
  () => localStorage.getItem('bazar_logged_in') === 'true'
);
const [isGuest, setIsGuest] = useState(false); // 비회원 모드
const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
```

### 화면 접근 제어 흐름

```
앱 진입
  ↓
!isLoggedIn && !isGuest? → 로그인 화면
  ↓ (로그인 or 비회원 선택)
메인 화면
  ↓ (보호된 탭/기능 접근 시)
requireLogin() 호출
  ↓
AlertModal (로그인하기 / 취소)
  ↓ 로그인하기 선택
로그인 화면으로 이동
```

### 보호된 기능 목록

| 기능 | 접근 제한 |
|------|-----------|
| 관심목록 탭 | 로그인 필요 |
| 알림 탭 | 로그인 필요 |
| 채팅 탭 | 로그인 필요 |
| 마이 탭 | 로그인 필요 |
| 등록 버튼 | 로그인 필요 |
| 입찰하기 버튼 | 로그인 필요 |
| 홈, 경매, 인기, 탐색 | 비회원도 가능 |

### requireLogin 함수

```tsx
const requireLogin = (action: () => void) => {
  if (!isLoggedIn) {
    // 컨펌 모달 표시
    showAlert(
      '로그인이 필요한 서비스입니다.\n로그인 페이지로 이동하시겠어요?',
      () => { setIsGuest(false); setAuthScreen('login'); }, // 확인
      () => {}  // 취소
    );
    return;
  }
  action(); // 로그인 상태면 원래 동작 실행
};
```

---

## 11. 주요 기능 구현 패턴

### 폼 이탈 방지 시스템

탭 클릭, 검색, 뒤로가기 등 모든 네비게이션을 가로챕니다.

```tsx
// 1. 폼이 더러워지면 App에 알림
useEffect(() => { onDirtyChange?.(isDirty); }, [isDirty]);

// 2. App에서 네비게이션 가로채기
const guardedNav = (action: () => void) => {
  if (isFormScreen && formDirty) {
    setPendingNav(() => action); // 동작을 보류
  } else {
    action(); // 바로 실행
  }
};

// 3. 확인 시 보류된 동작 실행
<LeaveConfirmModal
  onConfirm={() => {
    const action = pendingNav;
    setPendingNav(null);
    setFormDirty(false);
    action?.(); // 보류된 네비게이션 실행
  }}
/>
```

### 커스텀 알럿 시스템

브라우저 기본 `alert()`를 커스텀 모달로 대체합니다.

```tsx
// App.tsx에서 showAlert 함수 정의
const showAlert = (msg: string, onConfirm?: () => void, onCancel?: () => void) => {
  setAlertMsg(msg);
  setAlertConfirmCb(() => onConfirm ?? null);
  setAlertCancelCb(() => onCancel ?? null);
};

// 어디서든 Props로 전달받아 사용
showAlert('메시지', () => { /* 확인 */ }, () => { /* 취소 */ });
```

### 이미지 업로드 (FileReader API)

서버 없이 브라우저에서 이미지를 base64로 읽어 미리보기

```tsx
const reader = new FileReader();
reader.onload = (ev) => {
  const base64 = ev.target?.result as string;
  // "data:image/jpeg;base64,/9j/4AAQ..." 형식의 문자열
  setImages(prev => [...prev, base64]);
};
reader.readAsDataURL(file); // 파일을 base64로 변환 시작
```

### 카운트다운 타이머

```tsx
useEffect(() => {
  const timer = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 0) { clearInterval(timer); return 0; }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer); // ← 핵심! 메모리 누수 방지
}, []); // 빈 배열 = 마운트 시 1번만 실행
```

---

## 12. 타입 시스템

`src/types/index.ts`에 프로젝트 전체 타입이 정의됩니다.

### 주요 인터페이스

```tsx
// 경매 상품 (목록용 간단 타입)
interface AuctionItem {
  id: number;
  name: string;
  image: string;
  currentPrice: number;
  bidCount: number;
  timeLeft: number;  // 초 단위
  isLive: boolean;
  category: string;
}

// 경매 상세 (AuctionItem을 extends로 확장)
interface AuctionDetail extends AuctionItem {
  images: string[];       // 추가: 이미지 배열
  description: string;    // 추가: 상세 설명
  seller: string;
  sellerTemp: number;     // 판매자 온도
  bidHistory: BidHistory[];
  liked: boolean;
  // ...
}
```

### extends로 타입 재사용

```tsx
// Product에서 ProductDetail로 확장
interface Product { id, name, image, price, ... }
interface ProductDetail extends Product {
  images: string[];   // 이미지 배열 추가
  description: string; // 상세 설명 추가
  seller: string;
}
```

### 유니온 타입 & 리터럴 타입

```tsx
// 정해진 값만 허용
type ProductTag = 'new' | 'auction' | 'free' | 'good';
type NavTab = 'home' | 'search' | 'notification' | 'chat' | 'my';
condition: 'S급' | 'A급' | 'B급' | 'C급';
status: '판매중' | '거래완료' | '숨김';
```

### Omit - 특정 속성 제외

```tsx
// id를 제외한 MyProduct 타입
const addMyProduct = (product: Omit<MyProduct, 'id'>) => {
  const id = Date.now(); // id는 함수에서 생성
  myProductStore.unshift({ ...product, id });
};
```

---

## 13. 학습 포인트 요약

### React Hooks 사용 패턴

| Hook | 이 프로젝트에서의 사용 |
|------|----------------------|
| `useState` | 모든 UI 상태 관리 |
| `useEffect` | 타이머, 이벤트 리스너, 데이터 로딩 |
| `useRef` | DOM 접근, 렌더링 없이 값 추적 (드래그 속도 등) |
| `useCallback` | 이벤트 핸들러 메모이제이션 (mousemove 등) |
| `useContext` | Toast 전역 알림 시스템 |

### 핵심 JavaScript/React 패턴

```tsx
// 1. 옵셔널 체이닝 - undefined 에러 방지
onDirtyChange?.(isDirty);
item.auctionDate ?? '';

// 2. 스프레드 연산자 - 불변 업데이트
setImages(prev => [...prev, newImage]);
setModal(p => p && ({ ...p, name: e.target.value }));

// 3. 나머지 연산자로 순환 인덱스
((index - 1) % total + total) % total  // 음수도 처리

// 4. Array.from으로 배열 생성
Array.from({ length: 36 }, (_, i) => images[i % images.length])

// 5. Set으로 중복 제거
const uniqueUrls = [...new Set(frames)];
```

### 실무에서 개선할 부분

이 프로젝트는 학습/프로토타입용으로, 실제 서비스 개발 시 아래를 추가해야 합니다.

1. **API 연동** — mockData를 실제 REST API / GraphQL로 교체
2. **전역 상태 관리** — 규모가 커지면 Zustand, Redux Toolkit 도입
3. **URL 라우팅** — React Router로 뒤로가기, 북마크, 공유 URL 지원
4. **이미지 서버** — base64 대신 S3 등 클라우드 스토리지 업로드
5. **인증 보안** — localStorage 대신 HttpOnly Cookie + JWT
6. **에러 바운더리** — React Error Boundary로 에러 처리
7. **성능 최적화** — React.memo, useMemo, 가상 스크롤
8. **테스트** — Jest + React Testing Library

---

*이 문서는 BAZAR 프로젝트 v15 기준으로 작성되었습니다.*
