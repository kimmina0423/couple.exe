-- ============================================================
-- 0001_init.sql
-- Supabase SQL Editor 또는 supabase db push로 실행
-- ============================================================

-- ── 테이블 ────────────────────────────────────────────────

CREATE TABLE couples (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invite_code TEXT UNIQUE NOT NULL,
  level       INTEGER NOT NULL DEFAULT 1,
  exp         INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- auth.users와 1:1 연결
CREATE TABLE profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname   TEXT,
  couple_id  UUID REFERENCES couples(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 일기 (Q1~Q5 매핑)
-- q1_moment    : 오늘 파트너와 나눈 가장 기억에 남는 순간
-- q2_gratitude : 오늘 파트너에게 고마웠던 점
-- q3_conflict  : 오늘 서로 어긋났거나 속상했던 일
-- q4_mood      : 지금 나의 감정 상태 한 단어
-- q5_wish      : 내일 파트너에게 해주고 싶은 것
CREATE TABLE diary_entries (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  couple_id    UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  q1_moment    TEXT,
  q2_gratitude TEXT,
  q3_conflict  TEXT,
  q4_mood      TEXT,
  q5_wish      TEXT,
  temperature  SMALLINT CHECK (temperature BETWEEN 1 AND 10),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- AI 분석 리포트 (두 사람 모두 작성 후 생성)
CREATE TABLE daily_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id     UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  date          DATE NOT NULL,
  analysis_json JSONB,  -- 위험도, 4가지 독, 긍정비율, 메시지
  quest_json    JSONB,  -- 퀘스트 텍스트
  monster_json  JSONB,  -- 몬스터 트리거 정보
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (couple_id, date)
);

-- 퀘스트 완료 기록
CREATE TABLE quest_completions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id    UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  completed_by UUID NOT NULL REFERENCES auth.users(id),
  exp_gained   INTEGER NOT NULL DEFAULT 20,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (couple_id, date)
);

-- 관계 몬스터 (SILENCE: 침묵 괴물, CRITICISM: 비난 드래곤)
CREATE TABLE monsters (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id   UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('SILENCE', 'CRITICISM')),
  hp          INTEGER NOT NULL,
  max_hp      INTEGER NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  defeated_at TIMESTAMPTZ
);

-- ── RLS 활성화 ────────────────────────────────────────────

ALTER TABLE profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE couples         ENABLE ROW LEVEL SECURITY;
ALTER TABLE diary_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_reports   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monsters        ENABLE ROW LEVEL SECURITY;

-- ── 헬퍼 함수 ─────────────────────────────────────────────

-- 현재 유저의 couple_id를 반환 (RLS 정책에서 재사용)
CREATE OR REPLACE FUNCTION get_my_couple_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT couple_id FROM profiles WHERE id = auth.uid()
$$;

-- ── RLS 정책 ──────────────────────────────────────────────

-- profiles: 본인 + 같은 커플 파트너만 조회
CREATE POLICY "profiles_select" ON profiles
  FOR SELECT USING (
    id = auth.uid()
    OR couple_id = get_my_couple_id()
  );

CREATE POLICY "profiles_insert" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update" ON profiles
  FOR UPDATE USING (id = auth.uid());

-- couples: 멤버만 조회/수정
-- 커플 생성(INSERT)은 service role로만 — 초대 코드 검증 서버에서 처리
CREATE POLICY "couples_select" ON couples
  FOR SELECT USING (id = get_my_couple_id());

CREATE POLICY "couples_update" ON couples
  FOR UPDATE USING (id = get_my_couple_id());

-- diary_entries: 본인만 읽기/쓰기 (파트너는 원본 열람 불가)
CREATE POLICY "diary_select_own" ON diary_entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "diary_insert" ON diary_entries
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND couple_id = get_my_couple_id()
  );

CREATE POLICY "diary_update" ON diary_entries
  FOR UPDATE USING (user_id = auth.uid());

-- daily_reports: 커플 멤버 둘 다 조회 가능
-- INSERT/UPDATE는 service role(AI 분석 서버)만 — 정책 불필요
CREATE POLICY "reports_select" ON daily_reports
  FOR SELECT USING (couple_id = get_my_couple_id());

-- quest_completions: 커플 멤버 조회, 본인만 완료 등록
CREATE POLICY "quests_select" ON quest_completions
  FOR SELECT USING (couple_id = get_my_couple_id());

CREATE POLICY "quests_insert" ON quest_completions
  FOR INSERT WITH CHECK (
    couple_id = get_my_couple_id()
    AND completed_by = auth.uid()
  );

-- monsters: 커플 멤버 조회
-- INSERT/UPDATE는 service role만
CREATE POLICY "monsters_select" ON monsters
  FOR SELECT USING (couple_id = get_my_couple_id());

-- ── 신규 가입 시 profile 자동 생성 ───────────────────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
