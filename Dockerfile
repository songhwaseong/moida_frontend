# ── 1단계: 빌드 ──────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── 2단계: Nginx 서빙 ─────────────────────────────────────────
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# 기존 기본 파일 제거
RUN rm -rf ./*

# 빌드 결과물 복사
COPY --from=builder /app/dist .

# Nginx 설정 복사 (React Router 새로고침 대응)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
