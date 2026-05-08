import type { SupabaseClient } from '@supabase/supabase-js'

export const MONSTER_CONFIG = {
  SILENCE: {
    name: '침묵 괴물',
    emoji: '👻',
    description: '대화가 멀어질수록 커져요.',
    weakness: '작은 대화 시작이 약점이에요. 먼저 말을 건네보세요.',
    skills: [
      '"오늘 하루 어땠어? 한 가지만 얘기해줘."',
      '"나 오늘 네가 좀 보고 싶었어."',
      '"같이 차 한잔 할까? 아무 말 안 해도 돼."',
    ],
  },
  CRITICISM: {
    name: '비난 드래곤',
    emoji: '🐉',
    description: '인격 공격이 쌓일수록 강해져요.',
    weakness: '부드러운 I-message가 약점이에요. 상대가 아닌 내 감정을 말해보세요.',
    skills: [
      '"나는 그때 좀 속상한 감정이 들었어."',
      '"나 요즘 좀 힘들었는데, 들어줄 수 있어?"',
      '"네가 ~해줬으면 좋겠어." (요청으로 바꾸기)',
    ],
  },
} as const

export type MonsterType = keyof typeof MONSTER_CONFIG

const SIGNAL_THRESHOLD = 3  // 7일 중 3번 이상 감지 시 등장
const MAX_HP = 100

export async function syncMonsters(supabase: SupabaseClient, coupleId: string) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: reports } = await supabase
    .from('daily_reports')
    .select('analysis_json')
    .eq('couple_id', coupleId)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])

  if (!reports) return

  let silenceCount = 0
  let criticismCount = 0

  for (const report of reports) {
    const a = report.analysis_json as any
    if (!a) continue
    if (a.horsemen?.stonewalling || a.pursueWithdraw) silenceCount++
    if (a.horsemen?.criticism || a.horsemen?.contempt) criticismCount++
  }

  await upsertMonster(supabase, coupleId, 'SILENCE', silenceCount)
  await upsertMonster(supabase, coupleId, 'CRITICISM', criticismCount)
}

async function upsertMonster(
  supabase: SupabaseClient,
  coupleId: string,
  type: MonsterType,
  signalCount: number,
) {
  const { data: existing } = await supabase
    .from('monsters')
    .select('id, hp')
    .eq('couple_id', coupleId)
    .eq('type', type)
    .is('defeated_at', null)
    .maybeSingle()

  if (signalCount >= SIGNAL_THRESHOLD) {
    if (!existing) {
      await supabase.from('monsters').insert({
        couple_id: coupleId,
        type,
        hp: MAX_HP,
        max_hp: MAX_HP,
      })
    }
  } else {
    // 신호가 줄었으면 자동 처치
    if (existing) {
      await supabase
        .from('monsters')
        .update({ defeated_at: new Date().toISOString() })
        .eq('id', existing.id)
    }
  }
}

export async function damageMonster(
  supabase: SupabaseClient,
  coupleId: string,
  damage: number,
): Promise<{ type: MonsterType; defeated: boolean } | null> {
  const { data: monsters } = await supabase
    .from('monsters')
    .select('id, type, hp')
    .eq('couple_id', coupleId)
    .is('defeated_at', null)
    .order('created_at', { ascending: true })
    .limit(1)

  const monster = monsters?.[0]
  if (!monster) return null

  const newHp = Math.max(0, monster.hp - damage)
  const defeated = newHp === 0

  await supabase
    .from('monsters')
    .update({
      hp: newHp,
      ...(defeated ? { defeated_at: new Date().toISOString() } : {}),
    })
    .eq('id', monster.id)

  return { type: monster.type as MonsterType, defeated }
}
