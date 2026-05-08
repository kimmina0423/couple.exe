# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 개발 서버 실행

Node.js가 PATH에 없을 수 있으므로 아래 방식으로 실행:

```powershell
$env:PATH = "C:\Program Files\nodejs;" + $env:PATH
& "C:\Program Files\nodejs\npm.cmd" run dev
```

또는 PATH 등록 후 새 터미널에서:

```powershell
npm run dev
```

## 앱 개요

커플이 각자 하루 일기(5문항 + 관계 온도)를 작성하면, Claude AI가 가트만 이론 기반으로 두 사람의 일기를 분석해 관계 위험도·갈등 패턴을 감지하고, 오늘의 퀘스트와 관계 몬스터로 게임화하는 서비스.

## 아키텍처

### 핵심 데이터 흐름

```
일기 작성 (diary/new) 
  → saveDiary() [actions/diary.ts]
  → Supabase diary_entries 저장
  → /today 접속 시 파트너도 썼으면 getOrGenerateReport() 호출
  → analyzeCoupleDiary() [lib/analyzer.ts] — Claude Haiku 호출
  → daily_reports 저장 (RPC: save_daily_report)
  → syncMonsters() [lib/monster.ts] — 7일치 리포트 기반 몬스터 등장/처치 판정
  → 퀘스트 완료 시 completeQuest() [actions/quest.ts] — 커플 레벨/XP + 몬스터 HP 차감
```

### DB 테이블 관계

- `profiles` — 유저별 nickname, couple_id (FK → couples)
- `couples` — invite_code, level, exp
- `diary_entries` — user_id + date unique, 5문항 + temperature
- `daily_reports` — couple_id + date unique, analysis_json + quest_json
- `quest_completions` — couple_id + date, 퀘스트 하루 1회 제한
- `monsters` — couple_id, type(SILENCE|CRITICISM), hp, defeated_at

### RLS 우회 RPC

타인 일기는 RLS로 직접 SELECT 불가. 아래 RPC로만 접근:
- `get_couple_diaries(couple_id_input, date_input)` — 커플 일기 2개 조회
- `count_couple_diaries(couple_id_input, date_input)` — 제출 수 확인
- `save_daily_report(...)` — 리포트 저장
- `find_couple_by_code(code)` — 초대코드로 couple_id 조회

### AI 분석 (lib/analyzer.ts)

- 모델: `claude-haiku-4-5-20251001`
- `ANTHROPIC_API_KEY`가 없거나 `'나중에'`이면 자동으로 mockAnalysis() 사용
- 분석 결과: riskLevel(GREEN/YELLOW/RED), emotionKeywords, horsemen(4독 감지), pursueWithdraw, quest, monster, message

### 몬스터 시스템 (lib/monster.ts)

7일치 daily_reports를 집계해 신호가 3회 이상이면 몬스터 등장, 3회 미만으로 줄면 자동 처치. 퀘스트 완료 시 HP -20.
- SILENCE(침묵 괴물): stonewalling 또는 pursueWithdraw 감지
- CRITICISM(비난 드래곤): criticism 또는 contempt 감지

### 인증 및 라우트 보호

`middleware.ts`에서 `/home`, `/diary`, `/report`, `/couple` 경로를 보호. Supabase 세션 갱신을 위해 반드시 `getUser()` 호출을 유지해야 함.

### Supabase 클라이언트

- `lib/supabase/client.ts` — 브라우저 컴포넌트용
- `lib/supabase/server.ts` — 서버 컴포넌트·Server Actions용
- Server Actions는 모두 `'use server'` + `createClient()` 패턴 사용

## 환경변수

| 변수 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서비스 롤 키 (서버 전용) |
| `ANTHROPIC_API_KEY` | Claude API 키 (없으면 mock 사용) |
| `GEMINI_API_KEY` | Gemini API 키 |
