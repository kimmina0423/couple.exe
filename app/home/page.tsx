import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import HomeClient from './HomeClient'
import DeviceFrame from '@/components/DeviceFrame'
import MonsterCard from '@/app/today/MonsterCard'
import { syncMonsters } from '@/lib/monster'
import type { MonsterType } from '@/lib/monster'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: profile } = await supabase
    .from('profiles').select('nickname, couple_id').eq('id', user.id).single()

  const { data: myDiary } = await supabase
    .from('diary_entries').select('id').eq('user_id', user.id).eq('date', today).maybeSingle()

  let partnerWrote = false
  let couple = null
  let partnerNickname = '파트너'
  let streak = 0

  if (profile?.couple_id) {
    const { data: members } = await supabase
      .from('profiles').select('id, nickname').eq('couple_id', profile.couple_id)

    const partner = members?.find(m => m.id !== user.id)
    partnerNickname = partner?.nickname ?? '파트너'

    if (partner) {
      const { data: diaryCount } = await supabase
        .rpc('count_couple_diaries', { couple_id_input: profile.couple_id, date_input: today })
      partnerWrote = (diaryCount ?? 0) >= (myDiary ? 2 : 1)
    }

    const { data: coupleData } = await supabase
      .from('couples').select('level, exp').eq('id', profile.couple_id).single()
    couple = coupleData

    const { count } = await supabase
      .from('quest_completions')
      .select('id', { count: 'exact', head: true })
      .eq('couple_id', profile.couple_id)
    streak = count ?? 0
  }

  const bothWrote = !!myDiary && partnerWrote
  const xpForNext = 100 + ((couple?.level ?? 1) - 1) * 150
  const relHealth = Math.min(100, Math.round(((couple?.exp ?? 0) / xpForNext) * 100))

  // 몬스터 동기화 + 활성 몬스터 조회
  let activeMonsters: { type: string; hp: number; max_hp: number }[] = []
  if (profile?.couple_id) {
    try {
      await syncMonsters(supabase, profile.couple_id)
      const { data } = await supabase
        .from('monsters').select('type, hp, max_hp')
        .eq('couple_id', profile.couple_id).is('defeated_at', null)
      activeMonsters = data ?? []
    } catch { /* 몬스터 없으면 무시 */ }
  }

  return (
    <DeviceFrame
      relHealth={relHealth}
      xp={couple?.exp ?? 0}
      streak={streak}
      nickname={profile?.nickname ?? ''}
    >
      <HomeClient
        nickname={profile?.nickname ?? ''}
        partnerNickname={partnerNickname}
        relHealth={relHealth}
        streak={streak}
        xp={couple?.exp ?? 0}
        level={couple?.level ?? 1}
        myDiaryDone={!!myDiary}
        partnerDone={partnerWrote}
        bothWrote={bothWrote}
        hasCouple={!!profile?.couple_id}
      />

      {/* 활성 몬스터 */}
      {activeMonsters.length > 0 && (
        <div style={{ padding: '0 14px 14px' }}>
          {activeMonsters.map(m => (
            <MonsterCard
              key={m.type}
              type={m.type as MonsterType}
              hp={m.hp}
              maxHp={m.max_hp}
              coupleId={profile?.couple_id ?? ''}
            />
          ))}
        </div>
      )}
    </DeviceFrame>
  )
}
