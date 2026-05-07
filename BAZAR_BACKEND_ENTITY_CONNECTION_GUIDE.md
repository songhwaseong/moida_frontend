# BAZAR Spring Boot + JPA + MySQL 백엔드 구성 가이드

이 문서는 현재 React 프론트엔드가 사용하는 화면과 mock 데이터를 기준으로, 초보자가 Spring Boot 백엔드를 붙일 수 있도록 정리한 가이드입니다.

## 1. 프론트엔드 분석 요약

현재 프론트는 `src/data/*.ts`의 mock 데이터와 `localStorage`로 동작합니다. 백엔드로 바꿀 때는 아래 데이터를 DB에서 가져오도록 만들면 됩니다.

| 프론트 화면 | 현재 사용하는 데이터 | 백엔드 엔티티 |
| --- | --- | --- |
| 로그인/회원가입 | email, password, name, nickname, phone, 약관 동의 | `Member` |
| 홈/중고거래/인기/검색 | 상품 목록, 카테고리, 가격, 이미지, 찜 수 | `Product`, `ProductImage`, `Category`, `Wishlist` |
| 상품 상세 | 상품 상세, 판매자 정보, 이미지 여러 장, 즉시구매가 | `Product`, `ProductImage`, `Member` |
| 상품 등록 | 사진, 상품명, 카테고리, 상태, 가격, 거래방식, 위치, 연락처 | `Product`, `ProductImage`, `Auction` |
| 경매 목록/상세 | 현재가, 입찰 수, 남은 시간, 입찰 기록 | `Auction`, `Bid` |
| 찜 목록 | 내가 누른 찜 상품 | `Wishlist` |
| 채팅 | 채팅방, 메시지 | `ChatRoom`, `ChatMessage` |
| 마이페이지 주소 | 배송지명, 우편번호, 주소, 상세주소, 전화번호, 기본배송지 | `Address` |
| 마이페이지 지갑 | 잔액, 충전/출금, 계좌 | `Wallet`, `WalletTransaction`, `BankAccount` |
| 문의 | 상품/경매 문의, 답변 | `Inquiry` |
| 관리자 | 회원, 신고, 제재, 채팅 로그 | `Member`, `Report`, `Sanction`, `ChatRoom`, `ChatMessage` |

## 2. 추가한 백엔드 파일

Spring Boot 백엔드 뼈대는 `backend/` 폴더에 추가했습니다.

```text
backend/
  build.gradle
  settings.gradle
  src/main/resources/application.yml
  src/main/java/com/bazar/backend/BazarBackendApplication.java
  src/main/java/com/bazar/backend/common/
    BaseTimeEntity.java
    SecurityConfig.java
  src/main/java/com/bazar/backend/domain/
    Member.java
    Address.java
    Category.java
    Product.java
    ProductImage.java
    ProductTag.java
    Auction.java
    Bid.java
    Wishlist.java
    ChatRoom.java
    ChatMessage.java
    Inquiry.java
    Report.java
    Sanction.java
    Wallet.java
    BankAccount.java
    WalletTransaction.java
    enum 파일들...
```

## 3. 엔티티 설계 핵심

### Member

회원가입, 로그인, 마이페이지, 관리자 회원 관리의 중심입니다.

주요 필드:

```text
id              DB 내부 PK
memberNo        화면에 보여줄 회원번호
email           로그인 ID
password        암호화된 비밀번호 저장
name            실명
nickname        화면 표시 이름
phone           휴대폰 번호
role            USER / ADMIN
status          ACTIVE / SUSPENDED / PERMANENT / WITHDRAWN
mannerTemp      판매자 매너온도
termsAgreed     이용약관 동의
privacyAgreed   개인정보 동의
marketingAgreed 마케팅 동의
```

실무에서는 `password`에 원문 비밀번호를 넣으면 안 됩니다. 반드시 `BCryptPasswordEncoder`로 암호화해서 저장하세요.

### Product

중고거래 상품과 경매 상품의 기본 정보입니다. 현재 프론트의 `Product`, `ProductDetail`과 가장 많이 연결됩니다.

주요 필드:

```text
seller              판매자 Member
category            Category
title               상품명
description         상품 설명
price               일반 판매가 또는 기본 가격
immediatePrice      즉시구매가
productCondition    S / A / B / C
status              SELLING / RESERVED / SOLD / DELETED
tradeMethod         DIRECT / DELIVERY / BOTH
location            거래 희망 지역
contactPhone        판매자 연락처
phoneVerified       연락처 인증 여부
images              ProductImage 목록
tags                ProductTag 목록
```

프론트의 `image`, `images[]`는 `ProductImage` 테이블로 분리했습니다. 대표 이미지는 `mainImage = true`인 행입니다.

### Auction, Bid

경매 화면은 `Product` 위에 `Auction`이 얹히는 구조입니다.

```text
Product 1개 -> Auction 0개 또는 1개
Auction 1개 -> Bid 여러 개
```

상품 등록 화면에서 경매 시작가, 즉시구매가, 최소 입찰 단위를 입력하면 `Product`를 먼저 저장하고, 경매 옵션이 있으면 `Auction`을 추가 저장하면 됩니다.

### Wishlist

프론트의 `liked`, `likeCount`는 DB 컬럼 하나로 들고 있기보다 `Wishlist` 테이블로 계산하는 편이 안전합니다.

```text
liked     현재 로그인한 회원이 Wishlist에 등록했는지
likeCount 해당 product_id의 Wishlist 개수
```

### ChatRoom, ChatMessage

채팅방은 구매자와 판매자, 선택적으로 상품을 연결합니다.

```text
ChatRoom: product, buyer, seller, status
ChatMessage: chatRoom, sender, message, readByReceiver
```

처음에는 REST API로 메시지를 저장하고 조회해도 됩니다. 실시간 채팅은 나중에 WebSocket으로 확장하세요.

### Wallet, BankAccount, WalletTransaction

마이페이지 지갑 화면과 연결됩니다.

```text
Wallet             회원별 잔액
BankAccount        출금 계좌
WalletTransaction  충전, 출금, 결제, 환불, 판매 정산 기록
```

실제 돈이 오가는 기능은 결제대행사 연동 전까지는 테스트용으로만 구현하세요.

## 4. MySQL 준비

MySQL에서 DB를 만듭니다.

```sql
CREATE DATABASE bazar
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

CREATE USER 'bazar_user'@'localhost' IDENTIFIED BY 'bazar1234!';
GRANT ALL PRIVILEGES ON bazar.* TO 'bazar_user'@'localhost';
FLUSH PRIVILEGES;
```

그 다음 `backend/src/main/resources/application.yml`을 수정합니다.

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/bazar?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: bazar_user
    password: bazar1234!
```

개발 중에는 아래 설정을 유지하면 엔티티 기준으로 테이블이 자동 생성됩니다.

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

운영 서버에서는 `update` 대신 `validate` 또는 Flyway/Liquibase 같은 마이그레이션 도구를 쓰는 것이 좋습니다.

## 5. 백엔드 실행 방법

터미널 1개를 열고 백엔드를 실행합니다.

```bash
cd backend
./gradlew bootRun
```

Windows PowerShell에서는 다음처럼 실행합니다.

```powershell
cd backend
.\gradlew.bat bootRun
```

현재 저장소에는 Gradle Wrapper가 없을 수 있습니다. 그 경우 PC에 Gradle이 설치되어 있다면 다음 명령을 사용하세요.

```powershell
cd backend
gradle bootRun
```

실행 후 콘솔에 `Started BazarBackendApplication`이 보이면 백엔드 서버가 `http://localhost:8080`에서 켜진 것입니다.

## 6. 프론트엔드 실행 방법

터미널을 하나 더 열고 프론트를 실행합니다.

```powershell
npm install
npm run dev
```

프론트 주소는 보통 `http://localhost:5173`입니다. 백엔드의 `SecurityConfig`에서 이 주소를 CORS 허용했습니다.

## 7. 프론트에서 API로 바꾸는 순서

처음부터 모든 화면을 바꾸려고 하면 어렵습니다. 아래 순서대로 바꾸세요.

### 1단계: 상품 목록 API

먼저 백엔드에 이런 API를 만듭니다.

```text
GET /api/products
GET /api/products/{productId}
```

프론트의 `src/data/mockData.ts`에서 `PRODUCT_DETAILS`를 직접 쓰던 부분을 `fetch`로 바꿉니다.

예시:

```ts
const response = await fetch('http://localhost:8080/api/products');
const products = await response.json();
```

프론트가 기대하는 상품 목록 DTO 예시는 아래와 같습니다.

```json
{
  "id": 1,
  "name": "맥북 프로 M2",
  "image": "https://...",
  "location": "강남구",
  "timeAgo": "10분 전",
  "price": 980000,
  "condition": "A",
  "tags": ["good", "auction"],
  "likeCount": 12,
  "liked": false,
  "canAuction": true,
  "auctionDate": "2026-06-03",
  "category": "디지털"
}
```

DB 엔티티 이름은 `title`이지만 프론트 타입은 `name`입니다. Controller에서 DTO로 변환할 때 `title -> name`으로 바꿔주면 됩니다.

### 2단계: 상품 등록 API

상품 등록 화면은 다음 API로 연결합니다.

```text
POST /api/products
```

요청 예시:

```json
{
  "title": "나이키 에어맥스 90",
  "categoryId": 1,
  "condition": "A",
  "price": 65000,
  "immediatePrice": 65000,
  "tradeMethod": "BOTH",
  "location": "강남구",
  "description": "상태 좋은 운동화입니다.",
  "contactPhone": "010-1234-5678",
  "phoneVerified": true,
  "imageUrls": ["https://..."],
  "auction": {
    "startPrice": 30000,
    "immediatePrice": 65000,
    "minBidUnit": 1000,
    "startsAt": "2026-05-05T10:00:00",
    "endsAt": "2026-05-12T10:00:00"
  }
}
```

처음 개발할 때는 이미지 업로드를 바로 만들지 말고 `imageUrls`에 문자열 URL을 넣어서 먼저 DB 저장 흐름을 완성하세요. 그 다음 S3나 로컬 파일 업로드를 붙이면 훨씬 쉽습니다.

### 3단계: 회원가입/로그인 API

필요한 API:

```text
POST /api/auth/signup
POST /api/auth/login
GET /api/members/me
```

회원가입 화면 필드와 `Member` 엔티티 매핑:

```text
email       -> Member.email
password    -> Member.password, 저장 전 BCrypt 암호화
name        -> Member.name
nickname    -> Member.nickname
phone       -> Member.phone
terms       -> Member.termsAgreed
privacy     -> Member.privacyAgreed
marketing   -> Member.marketingAgreed
```

처음에는 세션 없이 로그인 성공 응답만 받아도 됩니다. 그 다음 단계에서 JWT를 붙이세요.

### 4단계: 찜 API

필요한 API:

```text
POST /api/products/{productId}/wishlist
DELETE /api/products/{productId}/wishlist
GET /api/members/me/wishlist
```

`Wishlist` 테이블에는 `member_id`, `product_id`가 들어갑니다. 같은 상품을 두 번 찜하지 못하도록 unique 제약을 걸어두었습니다.

### 5단계: 경매 API

필요한 API:

```text
GET /api/auctions
GET /api/auctions/{auctionId}
POST /api/auctions/{auctionId}/bids
```

입찰 시 체크해야 할 규칙:

```text
1. 경매 상태가 LIVE인지 확인
2. 현재 시간이 startsAt 이후, endsAt 이전인지 확인
3. 내 상품에는 입찰하지 못하게 확인
4. 새 입찰가가 currentPrice + minBidUnit 이상인지 확인
5. Bid 저장
6. Auction.currentPrice, Auction.bidCount 갱신
```

### 6단계: 마이페이지 API

주소:

```text
GET /api/members/me/addresses
POST /api/members/me/addresses
PUT /api/members/me/addresses/{addressId}
DELETE /api/members/me/addresses/{addressId}
```

지갑:

```text
GET /api/members/me/wallet
POST /api/members/me/wallet/deposit
POST /api/members/me/wallet/withdraw
GET /api/members/me/wallet/transactions
POST /api/members/me/bank-accounts
```

## 8. 초보자 추천 개발 순서

1. MySQL DB 생성
2. `application.yml` 계정 수정
3. 백엔드 실행해서 테이블 자동 생성 확인
4. `MemberRepository`, `ProductRepository`, `CategoryRepository`부터 만들기
5. 상품 목록 `GET /api/products` 만들기
6. 프론트 홈 화면만 mockData 대신 API로 바꾸기
7. 상품 상세 API 만들기
8. 상품 등록 API 만들기
9. 회원가입/로그인 만들기
10. 찜, 경매, 채팅, 관리자 순서로 확장

## 9. Repository 예시

`backend/src/main/java/com/bazar/backend/repository/ProductRepository.java`를 만들면 됩니다.

```java
package com.bazar.backend.repository;

import com.bazar.backend.domain.Product;
import com.bazar.backend.domain.ProductStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByStatusOrderByCreatedAtDesc(ProductStatus status);
}
```

회원 Repository 예시:

```java
package com.bazar.backend.repository;

import com.bazar.backend.domain.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByNickname(String nickname);
}
```

## 10. DTO를 꼭 쓰는 이유

엔티티를 그대로 프론트에 반환하지 마세요. 이유는 세 가지입니다.

```text
1. Member.password 같은 민감 정보가 노출될 수 있음
2. LAZY 관계 때문에 JSON 변환 오류가 날 수 있음
3. 프론트 필드명과 DB 필드명이 다름
```

예를 들어 `Product.title`은 프론트에서 `name`으로 필요합니다. 그래서 응답 DTO를 만들어 변환하는 방식이 좋습니다.

```java
public record ProductListResponse(
    Long id,
    String name,
    String image,
    String location,
    int price,
    String condition,
    int likeCount,
    boolean liked,
    String category
) {
}
```

## 11. 지금 엔티티에서 나중에 추가하면 좋은 것

처음부터 다 만들 필요는 없습니다. 기본 기능이 붙은 뒤 아래를 추가하세요.

```text
Review          거래 후기
Order/Trade     구매 확정, 판매 완료, 배송 상태
Notification    알림
SearchLog       검색 기록
RefreshToken    JWT 재발급
ImageFile       S3 업로드 파일 메타데이터
SuspiciousCase  관리자 의심 거래 탐지
```

## 12. 자주 나는 오류

### 프론트에서 API 호출이 막힘

원인: CORS 문제입니다.

확인할 것:

```yaml
app:
  cors:
    allowed-origin: http://localhost:5173
```

프론트 포트가 5173이 아니면 실제 Vite 주소로 바꿔주세요.

### 한글이 DB에서 깨짐

DB와 JDBC URL에 `utf8mb4`, `characterEncoding=UTF-8`이 들어가야 합니다.

```sql
ALTER DATABASE bazar CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 테이블이 안 생김

`application.yml`에서 아래 설정을 확인하세요.

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```

그리고 엔티티 클래스에 `@Entity`가 붙어 있어야 합니다.

### Spring Security 때문에 401이 뜸

현재 개발용 `SecurityConfig`는 `/api/**`를 모두 허용합니다. 나중에 JWT를 붙일 때 로그인, 회원가입만 허용하고 나머지는 인증 필요로 바꾸면 됩니다.

## 13. 다음 작업 추천

바로 다음 단계로는 Repository, DTO, Controller를 최소 세트로 추가해 상품 목록 API부터 실제로 연결하는 것을 추천합니다.

