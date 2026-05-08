# 커플 관계 성장 앱

가트만 이론 기반 커플 일기 & AI 분석 서비스 — MVP

---

## 기술 스택

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS**
- **Supabase** (Auth + PostgreSQL + RLS)
- **Anthropic API** (Claude — 일기 분석)

---

## 1. 프로젝트 초기화

> 아래 명령어를 이 디렉토리 안에서 순서대로 실행하세요.

```bash
# Next.js 프로젝트 생성 (현재 디렉토리에 설치)
npx create-next-app@latest . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"

# Supabase 클라이언트 (App Router용 SSR 패키지)
npm install @supabase/supabase-js @supabase/ssr

# Anthropic SDK
npm install @anthropic-ai/sdk
```

---

## 2. Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 → **New Project** 생성
2. **Settings > API** 에서 다음 값을 복사
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY`
3. `.env.example`을 복사해서 `.env.local` 생성 후 값 붙여넣기

```bash
cp .env.example .env.local
```

---

## 3. 마이그레이션 적용

### 방법 A — Supabase SQL Editor (간단)

1. Supabase 대시보드 → **SQL Editor** 탭
2. `supabase/migrations/0001_init.sql` 전체 내용 붙여넣기
3. **Run** 클릭

### 방법 B — Supabase CLI

```bash
# CLI 설치 (최초 1회)
npm install -g supabase

# 로그인
supabase login

# 로컬 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 적용
supabase db push
```

---

## 4. 로컬 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 프로젝트 구조

```
.
├── app/                   # Next.js App Router 페이지
├── lib/
│   └── supabase/
│       ├── client.ts      # 브라우저용 Supabase 클라이언트
│       └── server.ts      # 서버 컴포넌트 / 관리자용 클라이언트
├── middleware.ts           # 세션 갱신 + 라우트 보호
├── supabase/
│   └── migrations/
│       └── 0001_init.sql  # DB 스키마 + RLS 정책
├── docs/
│   └── mvp_spec.md        # MVP 기획 스펙
└── .env.example           # 환경변수 템플릿
```

---

## 환경변수 목록

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 키 (클라이언트 노출 가능) |
| `SUPABASE_SERVICE_ROLE_KEY` | 서비스 롤 키 (**절대 클라이언트 노출 금지**) |
| `ANTHROPIC_API_KEY` | Claude API 키 |
