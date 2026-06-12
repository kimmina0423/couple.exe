'use server'

import { createClient } from '@/lib/supabase/server'
import { damageMonster } from '@/lib/monster'
import { revalidatePath } from 'next/cache'

export async function pokePartner(coupleId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  // 찌르기 이벤트 저장 (테이블 없으면 조용히 실패)
  try {
    await supabase.from('poke_events').insert({
      couple_id: coupleId,
      poker_id: user.id,
    })
  } catch {
    // poke_events 테이블 미생성 시 무시 — docs/sql/poke_events.sql 실행 필요
  }

  // 활성 몬스터 HP -5
  const monsterResult = await damageMonster(supabase, coupleId, 5)

  revalidatePath('/today')

  return {
    success: true,
    monsterDefeated: monsterResult?.defeated ?? false,
    monsterType: monsterResult?.type ?? null,
    damage: 5,
  }
}

export async function markPokeSeen(coupleId: string, userId: string) {
  const supabase = createClient()
  try {
    await supabase
      .from('poke_events')
      .update({ seen_at: new Date().toISOString() })
      .eq('couple_id', coupleId)
      .neq('poker_id', userId)
      .is('seen_at', null)
  } catch {
    // 테이블 없으면 무시
  }
}
