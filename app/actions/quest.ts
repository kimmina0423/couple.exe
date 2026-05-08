'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { damageMonster } from '@/lib/monster'

function xpForNextLevel(level: number): number {
  // 1→2: 100XP, 2→3: 250XP, 이후 150씩 증가
  return 100 + (level - 1) * 150
}

export async function completeQuest(coupleId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const today = new Date().toISOString().split('T')[0]

  // 이미 완료했으면 무시
  const { data: existing } = await supabase
    .from('quest_completions')
    .select('id')
    .eq('couple_id', coupleId)
    .eq('date', today)
    .single()

  if (existing) return { alreadyDone: true }

  // 완료 기록 저장
  await supabase.from('quest_completions').insert({
    couple_id: coupleId,
    date: today,
    completed_by: user.id,
    exp_gained: 10,
  })

  // 현재 레벨/경험치 조회
  const { data: couple } = await supabase
    .from('couples')
    .select('level, exp')
    .eq('id', coupleId)
    .single()

  if (!couple) return { error: 'DB 오류' }

  const newExp = couple.exp + 10
  const threshold = xpForNextLevel(couple.level)
  const leveledUp = newExp >= threshold
  const newLevel = leveledUp ? couple.level + 1 : couple.level
  const finalExp = leveledUp ? newExp - threshold : newExp

  await supabase
    .from('couples')
    .update({ exp: finalExp, level: newLevel })
    .eq('id', coupleId)

  // 활성 몬스터 HP -20
  const monsterResult = await damageMonster(supabase, coupleId, 20)

  revalidatePath('/today')

  return {
    success: true,
    leveledUp,
    newLevel,
    newExp: finalExp,
    monsterDefeated: monsterResult?.defeated ?? false,
    monsterType: monsterResult?.type ?? null,
  }
}
