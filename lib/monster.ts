import type { SupabaseClient } from '@supabase/supabase-js'

export const MONSTER_CONFIG = {
  SILENCE: {
    name: '침묵 괴물',
    subtitle: 'The Silent One',
    color: '#9b59b6',
    glowColor: 'rgba(155,89,182,.4)',
    bgFrom: '#2c1654',
    bgTo: '#4a2070',
    description: '대화가 멀어질수록 커져요.',
    weakness: '작은 말 한마디가 약점이에요. 먼저 말을 건네보세요.',
    theory: 'Gottman Stonewalling + EFT Withdrawal',
    skills: [
      '"오늘 하루 어땠어? 한 가지만 얘기해줘."',
      '"나 오늘 네가 좀 보고 싶었어."',
      '"같이 차 한잔 할까? 아무 말 안 해도 돼."',
    ],
  },
  CRITICISM: {
    name: '비난 드래곤',
    subtitle: 'The Blaming Dragon',
    color: '#e74c3c',
    glowColor: 'rgba(231,76,60,.4)',
    bgFrom: '#5a0a0a',
    bgTo: '#8b1a1a',
    description: '인격 공격이 쌓일수록 강해져요.',
    weakness: '부드러운 I-message가 약점이에요. 상대가 아닌 내 감정을 말해보세요.',
    theory: 'Gottman Criticism/Contempt + EFT Secondary Emotion',
    skills: [
      '"나는 그때 좀 속상한 감정이 들었어."',
      '"나 요즘 좀 힘들었는데, 들어줄 수 있어?"',
      '"네가 ~해줬으면 좋겠어." (요청으로 바꾸기)',
    ],
  },
  ANXIETY: {
    name: '불안 유령',
    subtitle: 'The Anxious Phantom',
    color: '#f39c12',
    glowColor: 'rgba(243,156,18,.4)',
    bgFrom: '#3d2a00',
    bgTo: '#6b4a00',
    description: '확인이 반복될수록 더 커져요.',
    weakness: '"나는 여기 있어"라는 확신이 약점이에요. 먼저 안심시켜 주세요.',
    theory: 'EFT Abandonment Anxiety + Anxious Attachment',
    skills: [
      '"나 여기 있어. 아무 데도 안 가."',
      '"지금 힘들지? 나한테 말해도 돼."',
      '"오늘 잠들기 전에 연락할게."',
    ],
  },
  EMPTINESS: {
    name: '공허 괴물',
    subtitle: 'The Hollow One',
    color: '#7f8c8d',
    glowColor: 'rgba(127,140,141,.35)',
    bgFrom: '#1a1f2e',
    bgTo: '#2c3347',
    description: '감정이 메마를수록 단단해져요.',
    weakness: '작은 온기가 약점이에요. 아무 이유 없이 먼저 다가가 보세요.',
    theory: 'EFT Emotional Numbness + Mutual Withdrawal',
    skills: [
      '"그냥 네 옆에 있고 싶어서."',
      '"오늘 같이 뭐라도 먹을까?"',
      '"특별한 이유 없이, 그냥 보고 싶었어."',
    ],
  },
} as const

export type MonsterType = keyof typeof MONSTER_CONFIG

const SIGNAL_THRESHOLD = 3
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
  let anxietyCount = 0
  let emptinessCount = 0

  for (const report of reports) {
    const a = report.analysis_json as any
    if (!a) continue

    // 새 스키마 (userA/userB.gottmanSignals + cycle)
    const allSignals: string[] = [
      ...(a.userA?.gottmanSignals ?? []),
      ...(a.userB?.gottmanSignals ?? []),
    ]
    const cycleType: string = a.cycle?.type ?? ''
    const userARoles: string = a.userA?.role ?? ''
    const userBRoles: string = a.userB?.role ?? ''
    const longingA: string[] = a.userA?.attachmentLongings ?? []
    const longingB: string[] = a.userB?.attachmentLongings ?? []

    const hasStonewalling = allSignals.includes('담쌓기')
    const hasCriticism    = allSignals.includes('비난') || allSignals.includes('경멸')
    const hasCycle        = a.cycle?.detected === true
    const isPursuerWithdrawer = cycleType === 'pursuer-withdrawer'
    const isMutualWithdraw    = cycleType === 'mutual-withdrawal'

    // 불안 유령: pursuer-withdrawer 고리 또는 유기 불안 갈망
    const hasAbandonmentLonging = [...longingA, ...longingB].some(l =>
      l.includes('유기') || l.includes('확신') || l.includes('우선순위')
    )

    // 공허 괴물: 양쪽 모두 철수 또는 감정 마비
    const isMutualEmpty =
      isMutualWithdraw ||
      (a.emotionalDepth === 'surface' && isMutualWithdraw) ||
      (userARoles === 'withdrawer' && userBRoles === 'withdrawer')

    // 구버전 스키마 fallback
    if (hasStonewalling || a.pursueWithdraw || (hasCycle && isPursuerWithdrawer)) silenceCount++
    if (hasCriticism || a.horsemen?.criticism || a.horsemen?.contempt) criticismCount++
    if (hasAbandonmentLonging || (hasCycle && isPursuerWithdrawer)) anxietyCount++
    if (isMutualEmpty) emptinessCount++
  }

  await Promise.all([
    upsertMonster(supabase, coupleId, 'SILENCE',   silenceCount),
    upsertMonster(supabase, coupleId, 'CRITICISM',  criticismCount),
    upsertMonster(supabase, coupleId, 'ANXIETY',    anxietyCount),
    upsertMonster(supabase, coupleId, 'EMPTINESS',  emptinessCount),
  ])
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
  } else if (existing) {
    await supabase
      .from('monsters')
      .update({ defeated_at: new Date().toISOString() })
      .eq('id', existing.id)
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
