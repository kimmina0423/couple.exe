-- poke_events 테이블: 파트너 캐릭터 콕콕 찌르기 기록
-- Supabase SQL Editor에서 한 번 실행하세요.

CREATE TABLE IF NOT EXISTS poke_events (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id  uuid NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  poker_id   uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  seen_at    timestamptz
);

-- 인덱스: 빠른 조회를 위해
CREATE INDEX IF NOT EXISTS poke_events_couple_id_idx ON poke_events(couple_id);
CREATE INDEX IF NOT EXISTS poke_events_unseen_idx    ON poke_events(couple_id, seen_at) WHERE seen_at IS NULL;

-- RLS 활성화
ALTER TABLE poke_events ENABLE ROW LEVEL SECURITY;

-- 같은 커플 멤버만 읽기 가능
CREATE POLICY "couple members can view pokes" ON poke_events
  FOR SELECT USING (
    couple_id IN (
      SELECT couple_id FROM profiles WHERE id = auth.uid()
    )
  );

-- 본인이 자신의 커플에게만 찌르기 가능
CREATE POLICY "couple members can insert pokes" ON poke_events
  FOR INSERT WITH CHECK (
    poker_id = auth.uid()
    AND couple_id IN (
      SELECT couple_id FROM profiles WHERE id = auth.uid()
    )
  );

-- seen_at 업데이트는 커플 멤버 누구나 가능
CREATE POLICY "couple members can mark pokes seen" ON poke_events
  FOR UPDATE USING (
    couple_id IN (
      SELECT couple_id FROM profiles WHERE id = auth.uid()
    )
  );
