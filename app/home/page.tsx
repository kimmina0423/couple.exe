import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signOut } from '@/app/actions/auth'
import HomeClient from './HomeClient'

export default async function HomePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, couple_id')
    .eq('id', user.id)
    .single()

  const { data: myDiary } = await supabase
    .from('diary_entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle()

  let partnerWrote = false
  let couple = null
  let partnerNickname = '파트너'
  let streak = 0

  if (profile?.couple_id) {
    const { data: members } = await supabase
      .from('profiles')
      .select('id, nickname')
      .eq('couple_id', profile.couple_id)

    const partner = members?.find(m => m.id !== user.id)
    partnerNickname = partner?.nickname ?? '파트너'

    if (partner) {
      const { data: diaryCount } = await supabase
        .rpc('count_couple_diaries', { couple_id_input: profile.couple_id, date_input: today })
      partnerWrote = (diaryCount ?? 0) >= (myDiary ? 2 : 1)
    }

    const { data: coupleData } = await supabase
      .from('couples')
      .select('level, exp')
      .eq('id', profile.couple_id)
      .single()
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

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      {/* 헤더 */}
      <div style={{ padding: '20px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="cursive" style={{ fontSize: 24, color: 'var(--p-600)', textShadow: '1.5px 1.5px 0 #fff' }}>
          couple ♡
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: 'linear-gradient(180deg,#fff,var(--p-200))', border: '1.5px solid var(--p-500)',
            borderRadius: 999, padding: '4px 12px', fontSize: 13, fontWeight: 700,
            color: 'var(--p-700)', boxShadow: '0 0 0 2px #fff, 0 0 0 3px var(--p-400)',
            textShadow: '1px 1px 0 #fff',
          }}>{profile?.nickname} ♡</span>
          <form action={signOut}>
            <button style={{
              background: '#fff', border: '1.5px solid var(--p-300)', borderRadius: 999,
              padding: '4px 12px', fontSize: 11, color: 'var(--ink-2)', cursor: 'pointer',
            }}>로그아웃</button>
          </form>
        </div>
      </div>

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
    </div>
  )
}
