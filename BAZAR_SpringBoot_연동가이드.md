# BAZAR × Spring Boot REST API 연동 가이드

> 현재 mockData 기반 프론트엔드를 Spring Boot REST API와 연동하는 전체 과정을 단계별로 설명합니다.

---

## 목차

1. [전체 아키텍처](#1-전체-아키텍처)
2. [Spring Boot 프로젝트 설정](#2-spring-boot-프로젝트-설정)
3. [API 설계 (엔드포인트 정의)](#3-api-설계-엔드포인트-정의)
4. [프론트엔드 API 클라이언트 구성](#4-프론트엔드-api-클라이언트-구성)
5. [mockData → API 교체 작업](#5-mockdata--api-교체-작업)
6. [인증 시스템 (JWT)](#6-인증-시스템-jwt)
7. [이미지 업로드 (S3 연동)](#7-이미지-업로드-s3-연동)
8. [에러 처리](#8-에러-처리)
9. [CORS 설정](#9-cors-설정)
10. [Spring Boot 엔티티 & API 코드 예시](#10-spring-boot-엔티티--api-코드-예시)

---

## 1. 전체 아키텍처

```
[React 프론트엔드]          [Spring Boot 백엔드]        [인프라]
  localhost:5173    ←→      localhost:8080        ←→   MySQL
                              REST API                   S3 (이미지)
                              Spring Security            Redis (세션/캐시)
                              JWT
```

### 통신 방식

```
브라우저 → fetch() / axios → Spring Boot Controller
                               ↓
                           Service Layer
                               ↓
                           JPA Repository
                               ↓
                            MySQL DB
```

---

## 2. Spring Boot 프로젝트 설정

### build.gradle 의존성

```gradle
dependencies {
    // Spring Boot 기본
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation 'org.springframework.boot:spring-boot-starter-security'
    implementation 'org.springframework.boot:spring-boot-starter-validation'

    // DB
    runtimeOnly 'com.mysql:mysql-connector-j'

    // JWT
    implementation 'io.jsonwebtoken:jjwt-api:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-impl:0.12.3'
    runtimeOnly 'io.jsonwebtoken:jjwt-jackson:0.12.3'

    // AWS S3 (이미지 업로드)
    implementation 'software.amazon.awssdk:s3:2.25.0'

    // Lombok
    compileOnly 'org.projectlombok:lombok'
    annotationProcessor 'org.projectlombok:lombok'

    // 테스트
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
    testImplementation 'org.springframework.security:spring-security-test'
}
```

### application.yml

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/bazar?characterEncoding=UTF-8&serverTimezone=Asia/Seoul
    username: root
    password: your_password
    driver-class-name: com.mysql.cj.jdbc.Driver

  jpa:
    hibernate:
      ddl-auto: update        # 개발: update, 운영: validate
    show-sql: true
    properties:
      hibernate:
        format_sql: true
        dialect: org.hibernate.dialect.MySQLDialect

jwt:
  secret: your_very_long_secret_key_at_least_256_bits
  expiration: 86400000        # 24시간 (ms)
  refresh-expiration: 604800000 # 7일

aws:
  s3:
    bucket: bazar-images
    region: ap-northeast-2

# CORS
cors:
  allowed-origins: http://localhost:5173
```

---

## 3. API 설계 (엔드포인트 정의)

### 인증 API

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|-----------|
| POST | `/api/auth/signup` | 회원가입 | ❌ |
| POST | `/api/auth/login` | 로그인 | ❌ |
| POST | `/api/auth/logout` | 로그아웃 | ✅ |
| POST | `/api/auth/refresh` | 토큰 갱신 | ❌ |
| GET | `/api/auth/me` | 내 정보 조회 | ✅ |

### 상품 API

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|-----------|
| GET | `/api/products` | 상품 목록 | ❌ |
| GET | `/api/products/{id}` | 상품 상세 | ❌ |
| POST | `/api/products` | 상품 등록 | ✅ |
| PUT | `/api/products/{id}` | 상품 수정 | ✅ |
| DELETE | `/api/products/{id}` | 상품 삭제 | ✅ |
| GET | `/api/products/my` | 내 상품 목록 | ✅ |
| POST | `/api/products/{id}/like` | 관심 등록/해제 | ✅ |

### 경매 API

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|-----------|
| GET | `/api/auctions` | 경매 목록 | ❌ |
| GET | `/api/auctions/{id}` | 경매 상세 | ❌ |
| POST | `/api/auctions/{id}/bid` | 입찰 | ✅ |
| GET | `/api/auctions/{id}/bids` | 입찰 내역 | ❌ |

### 이미지 API

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|-----------|
| POST | `/api/images/upload` | 이미지 업로드 | ✅ |

### 검색 API

| Method | URL | 설명 | 인증 필요 |
|--------|-----|------|-----------|
| GET | `/api/search?q={keyword}&type={all\|product\|auction}` | 통합 검색 | ❌ |

### 공통 응답 형식

```json
{
  "success": true,
  "message": "요청이 처리되었습니다.",
  "data": { ... },
  "timestamp": "2026-04-29T12:00:00"
}
```

```json
{
  "success": false,
  "message": "인증이 필요합니다.",
  "errorCode": "UNAUTHORIZED",
  "timestamp": "2026-04-29T12:00:00"
}
```

---

## 4. 프론트엔드 API 클라이언트 구성

### src/api/client.ts 생성

```typescript
// API 기본 설정
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';

// 공통 fetch 래퍼
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token');

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  // 401 → 토큰 만료, 자동 갱신 시도
  if (response.status === 401) {
    const refreshed = await refreshToken();
    if (refreshed) {
      return request<T>(endpoint, options); // 재시도
    } else {
      localStorage.removeItem('access_token');
      window.location.href = '/'; // 로그인으로
      throw new Error('인증이 만료되었습니다.');
    }
  }

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message ?? '오류가 발생했습니다.');
  }

  return json.data as T;
}

// 토큰 갱신
async function refreshToken(): Promise<boolean> {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    });
    const json = await res.json();
    if (json.success) {
      localStorage.setItem('access_token', json.data.accessToken);
      return true;
    }
  } catch { /* 실패 */ }
  return false;
}

// 편의 메서드
export const api = {
  get:    <T>(url: string) =>
    request<T>(url),
  post:   <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),
  put:    <T>(url: string, body?: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: <T>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
};
```

### src/api/products.ts

```typescript
import { api } from './client';
import type { Product, ProductDetail } from '../types';

// 상품 목록 조회
export const getProducts = (params?: {
  category?: string;
  sort?: 'latest' | 'price_asc' | 'price_desc';
  page?: number;
  size?: number;
}) => {
  const query = new URLSearchParams(params as Record<string, string>).toString();
  return api.get<{ content: Product[]; totalElements: number }>
    (`/api/products?${query}`);
};

// 상품 상세 조회
export const getProduct = (id: number) =>
  api.get<ProductDetail>(`/api/products/${id}`);

// 상품 등록
export const createProduct = (data: {
  title: string;
  category: string;
  condition: string;
  price: number;
  description: string;
  location: string;
  imageUrls: string[];
  auctionStartPrice?: number;
  tradeMethod: string;
}) => api.post<{ id: number }>('/api/products', data);

// 상품 수정
export const updateProduct = (id: number, data: Partial<typeof createProduct>) =>
  api.put(`/api/products/${id}`, data);

// 상품 삭제
export const deleteProduct = (id: number) =>
  api.delete(`/api/products/${id}`);

// 관심 등록/해제
export const toggleLike = (id: number) =>
  api.post<{ liked: boolean; likeCount: number }>(`/api/products/${id}/like`);
```

### src/api/auth.ts

```typescript
import { api } from './client';

// 로그인
export const login = async (email: string, password: string) => {
  const res = await api.post<{
    accessToken: string;
    refreshToken: string;
    user: { id: number; nickname: string; email: string };
  }>('/api/auth/login', { email, password });

  localStorage.setItem('access_token', res.accessToken);
  localStorage.setItem('refresh_token', res.refreshToken);
  return res.user;
};

// 로그아웃
export const logout = async () => {
  await api.post('/api/auth/logout');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// 회원가입
export const signup = (data: {
  email: string;
  password: string;
  nickname: string;
  phone: string;
}) => api.post('/api/auth/signup', data);

// 내 정보 조회
export const getMe = () =>
  api.get<{ id: number; nickname: string; email: string; temperature: number }>
    ('/api/auth/me');
```

### src/api/auctions.ts

```typescript
import { api } from './client';
import type { AuctionDetail } from '../types';

// 경매 목록
export const getAuctions = () =>
  api.get<AuctionDetail[]>('/api/auctions');

// 경매 상세
export const getAuction = (id: number) =>
  api.get<AuctionDetail>(`/api/auctions/${id}`);

// 입찰
export const placeBid = (auctionId: number, amount: number) =>
  api.post<{ currentPrice: number; bidCount: number }>
    (`/api/auctions/${auctionId}/bid`, { amount });
```

### src/api/images.ts

```typescript
// 이미지 업로드 (multipart/form-data)
export const uploadImage = async (file: File): Promise<string> => {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/api/images/upload`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
      // Content-Type은 설정하지 않음 (브라우저가 자동으로 multipart 설정)
    }
  );
  const json = await res.json();
  return json.data.url; // S3 URL 반환
};
```

---

## 5. mockData → API 교체 작업

### 현재 구조 (mockData)

```tsx
// HomePage.tsx - 현재
import { AUCTION_ITEMS, PRODUCTS } from '../data/mockData';

const filteredAuctions = AUCTION_ITEMS.filter(...);
```

### 변경 후 (API 연동)

```tsx
// HomePage.tsx - 변경 후
import { useState, useEffect } from 'react';
import { getAuctions } from '../api/auctions';
import { getProducts } from '../api/products';
import type { AuctionItem, Product } from '../types';

const HomePage: React.FC<Props> = ({ ... }) => {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [auctionData, productData] = await Promise.all([
          getAuctions(),
          getProducts(),
        ]);
        setAuctions(auctionData);
        setProducts(productData.content);
      } catch (err) {
        setError('데이터를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error)   return <ErrorMessage message={error} />;

  return (
    <main>
      {/* 기존과 동일하게 사용 */}
    </main>
  );
};
```

### 커스텀 Hook으로 분리 (권장)

```typescript
// src/hooks/useAuctions.ts
export function useAuctions() {
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAuctions()
      .then(setAuctions)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { auctions, loading, error };
}

// 사용
const { auctions, loading, error } = useAuctions();
```

### SellPage 이미지 업로드 변경

```tsx
// 기존: FileReader로 base64 변환 → 로컬 상태에 저장
// 변경: 서버에 업로드 후 URL을 상태에 저장

const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files ?? []);
  const remaining = 10 - images.length;

  for (const file of files.slice(0, remaining)) {
    try {
      setUploading(true);
      const url = await uploadImage(file); // S3 URL 반환
      setImages(prev => [...prev, url]);
    } catch {
      showToast('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  }
};
```

---

## 6. 인증 시스템 (JWT)

### Spring Boot - JWT 필터

```java
// JwtAuthenticationFilter.java
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain chain
    ) throws ServletException, IOException {

        // 헤더에서 토큰 추출
        String token = resolveToken(request);

        if (token != null && tokenProvider.validateToken(token)) {
            Authentication auth = tokenProvider.getAuthentication(token);
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        chain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
```

### Spring Boot - 인증 컨트롤러

```java
// AuthController.java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
        @RequestBody @Valid LoginRequest request
    ) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<Void>> signup(
        @RequestBody @Valid SignupRequest request
    ) {
        authService.signup(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserResponse>> getMe(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(authService.getMe(userDetails.getUsername()))
        );
    }
}
```

---

## 7. 이미지 업로드 (S3 연동)

### Spring Boot - S3 서비스

```java
// S3Service.java
@Service
@RequiredArgsConstructor
public class S3Service {

    private final S3Client s3Client;

    @Value("${aws.s3.bucket}")
    private String bucket;

    public String upload(MultipartFile file) throws IOException {
        String fileName = "products/" + UUID.randomUUID() + "_" + file.getOriginalFilename();

        s3Client.putObject(
            PutObjectRequest.builder()
                .bucket(bucket)
                .key(fileName)
                .contentType(file.getContentType())
                .build(),
            RequestBody.fromBytes(file.getBytes())
        );

        return "https://" + bucket + ".s3.ap-northeast-2.amazonaws.com/" + fileName;
    }
}

// ImageController.java
@RestController
@RequestMapping("/api/images")
@RequiredArgsConstructor
public class ImageController {

    private final S3Service s3Service;

    @PostMapping("/upload")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, String>>> upload(
        @RequestParam("file") MultipartFile file
    ) throws IOException {
        String url = s3Service.upload(file);
        return ResponseEntity.ok(
            ApiResponse.success(Map.of("url", url))
        );
    }
}
```

---

## 8. 에러 처리

### Spring Boot - 전역 예외 처리

```java
// GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 유효성 검사 실패
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidation(
        MethodArgumentNotValidException e
    ) {
        String message = e.getBindingResult().getFieldErrors()
            .stream()
            .map(err -> err.getField() + ": " + err.getDefaultMessage())
            .collect(Collectors.joining(", "));

        return ResponseEntity.badRequest()
            .body(ApiResponse.error("VALIDATION_ERROR", message));
    }

    // 인증 실패
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ApiResponse<Void>> handleUnauthorized(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiResponse.error("UNAUTHORIZED", e.getMessage()));
    }

    // 찾을 수 없음
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(EntityNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("NOT_FOUND", e.getMessage()));
    }

    // 기타 서버 오류
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        return ResponseEntity.internalServerError()
            .body(ApiResponse.error("SERVER_ERROR", "서버 오류가 발생했습니다."));
    }
}
```

### 프론트엔드 - 에러 상태 컴포넌트

```tsx
// src/components/ErrorMessage.tsx
const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({
  message, onRetry
}) => (
  <div style={{ textAlign: 'center', padding: '40px 20px' }}>
    <p style={{ fontSize: 40 }}>⚠️</p>
    <p style={{ fontSize: 15, color: 'var(--text)', marginBottom: 16 }}>{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '10px 24px', background: 'var(--primary)', color: '#fff',
          border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14
        }}
      >
        다시 시도
      </button>
    )}
  </div>
);

// src/components/LoadingSpinner.tsx
const LoadingSpinner: React.FC = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
    <div style={{
      width: 36, height: 36,
      border: '3px solid #F0F1F4',
      borderTop: '3px solid var(--primary)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  </div>
);
```

---

## 9. CORS 설정

### Spring Boot

```java
// CorsConfig.java
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of(
            "http://localhost:5173",    // Vite 개발 서버
            "https://bazar.com"        // 운영 도메인
        ));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // 쿠키/인증 헤더 허용
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
```

### 프론트엔드 - 환경변수

```bash
# .env.development
VITE_API_URL=http://localhost:8080

# .env.production
VITE_API_URL=https://api.bazar.com
```

```typescript
// 사용
const BASE_URL = import.meta.env.VITE_API_URL;
```

---

## 10. Spring Boot 엔티티 & API 코드 예시

### Product 엔티티

```java
// Product.java
@Entity
@Table(name = "products")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Integer price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCondition condition; // S급, A급, B급, C급

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductStatus status; // SELLING, SOLD, HIDDEN

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false, length = 50)
    private String location;

    // 이미지 URL 목록 (별도 테이블)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<ProductImage> images = new ArrayList<>();

    @Column(nullable = false)
    private int likeCount = 0;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    // 정적 팩토리 메서드
    public static Product create(User seller, String title, String description,
                                  int price, ProductCondition condition,
                                  String category, String location) {
        Product p = new Product();
        p.seller = seller;
        p.title = title;
        p.description = description;
        p.price = price;
        p.condition = condition;
        p.category = category;
        p.location = location;
        p.status = ProductStatus.SELLING;
        return p;
    }
}
```

### Product API 컨트롤러

```java
// ProductController.java
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // 목록 조회
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductListResponse>>> getProducts(
        @RequestParam(required = false) String category,
        @RequestParam(defaultValue = "latest") String sort,
        @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(productService.getProducts(category, sort, pageable))
        );
    }

    // 상세 조회
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProduct(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(productService.getProduct(id))
        );
    }

    // 등록
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Map<String, Long>>> createProduct(
        @RequestBody @Valid CreateProductRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        Long productId = productService.create(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success(Map.of("id", productId)));
    }

    // 수정
    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> updateProduct(
        @PathVariable Long id,
        @RequestBody @Valid UpdateProductRequest request,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        productService.update(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // 삭제
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        productService.delete(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // 관심 토글
    @PostMapping("/{id}/like")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<LikeResponse>> toggleLike(
        @PathVariable Long id,
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(productService.toggleLike(id, userDetails.getUsername()))
        );
    }

    // 내 상품
    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<ProductListResponse>>> getMyProducts(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
            ApiResponse.success(productService.getMyProducts(userDetails.getUsername()))
        );
    }
}
```

### 공통 응답 래퍼

```java
// ApiResponse.java
@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;
    private final String timestamp;

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "요청이 처리되었습니다.", data,
            LocalDateTime.now().toString());
    }

    public static <T> ApiResponse<T> error(String errorCode, String message) {
        return new ApiResponse<>(false, message, null,
            LocalDateTime.now().toString());
    }
}
```

---

## 연동 순서 (권장)

```
1단계: Spring Boot 프로젝트 생성 & DB 연결
   → MySQL 테이블 자동 생성 확인

2단계: 인증 API 완성 (회원가입/로그인/JWT)
   → 프론트에서 로그인 → 토큰 저장 확인

3단계: 상품 CRUD API
   → 프론트 SellPage에서 실제 등록 테스트

4단계: 경매 API + 입찰 기능

5단계: 이미지 업로드 (S3)
   → base64 저장 → S3 URL 저장으로 교체

6단계: 검색 API

7단계: 마이페이지 API (주문내역, 판매내역 등)
```

---

*이 가이드는 BAZAR 프론트엔드 v15 기준으로 작성되었습니다.*
*Spring Boot 3.x, Java 17+ 기준입니다.*
