import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { analyzeCoupleDiary } from '@/lib/analyzer'
import { syncMonsters } from '@/lib/monster'
import QuestButton from './QuestButton'
import MonsterCard from './MonsterCard'
import type { AnalysisResult } from '@/lib/analyzer'
import type { MonsterType } from '@/lib/monster'
import { PixelBar } from '@/components/y2k'
import DeviceFrame from '@/components/DeviceFrame'

const RISK_CONFIG = {
  GREEN:  { label: '오늘 우리는 안정적이에요',      bg: '#d4f0e2', border: '#7dcfa8', text: '#2e6b4f', icon: '✦' },
  YELLOW: { label: '조금 주의가 필요한 하루예요',    bg: 'var(--lavender)', border: 'var(--blue-2)', text: '#5a45a0', icon: '▸' },
  RED:    { label: '오늘 서로 힘들었던 것 같아요',   bg: 'var(--p-200)', border: 'var(--p-500)', text: 'var(--p-700)', icon: '⚠' },
}

const HORSEMEN_LABELS = {
  criticism: '비난', defensiveness: '방어', contempt: '경멸', stonewalling: '담쌓기',
}

const cardStyle = {
  border: '1.5px solid var(--p-500)', borderRadius: 16,
  boxShadow: '0 0 0 3px #fff, 0 0 0 4.5px var(--p-500), 0 8px 14px -6px rgba(238,131,177,.4)',
  background: '#fff', overflow: 'hidden',
} as React.CSSProperties

async function getOrGenerateReport(supabase: Awaited<ReturnType<typeof createClient>>, coupleId: string, myId: string) {
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('daily_reports').select('analysis_json, quest_json')
    .eq('couple_id', coupleId).eq('date', today).single()
  if (existing) return { analysis: existing.analysis_json as AnalysisResult, quest: existing.quest_json as AnalysisResult['quest'] }

  const { data: diaries } = await supabase.rpc('get_couple_diaries', { couple_id_input: coupleId, date_input: today })
  if (!diaries || diaries.length < 2) return null
  const myDiary = diaries.find((d: any) => d.user_id === myId)
  const partnerDiary = diaries.find((d: any) => d.user_id !== myId)
  if (!myDiary || !partnerDiary) return null

  const analysis = await analyzeCoupleDiary(myDiary, partnerDiary)
  await supabase.rpc('save_daily_report', { couple_id_input: coupleId, date_input: today, analysis, quest: analysis.quest, monster: analysis.monster })
  return { analysis, quest: analysis.quest }
}

export default async function TodayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]
  const { data: profile } = await supabase
    .from('profiles').select('nickname, couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) {
    return (
      <DeviceFrame nickname={profile?.nickname ?? ''}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 14, textAlign: 'center' }}>
          <div style={{ animation: 'heartbeat 1.6s infinite' }}>
            <svg viewBox="0 0 36 32" width={52}>
              <path d="M18 30 C 4 22, 0 14, 0 9 C 0 3, 4 0, 9 0 C 13 0, 16 2, 18 5 C 20 2, 23 0, 27 0 C 32 0, 36 3, 36 9 C 36 14, 32 22, 18 30 Z" fill="#ffb6d0" stroke="#ff9ec5" strokeWidth="1.2" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>파트너와 연결되지 않았어요.</div>
          <Link href="/couple" style={{ color: 'var(--p-600)', fontWeight: 700, textDecoration: 'none', fontFamily: 'var(--font-round)', fontSize: 13 }}>
            커플 연결하러 가기 →
          </Link>
        </div>
      </DeviceFrame>
    )
  }

  const coupleId = profile.couple_id
  const { data: myDiary } = await supabase
    .from('diary_entries').select('id').eq('user_id', user.id).eq('date', today).single()
  const { data: diaryCount } = await supabase
    .rpc('count_couple_diaries', { couple_id_input: coupleId, date_input: today })
  const partnerDiary = (diaryCount ?? 0) >= 2

  if (!myDiary) redirect('/diary/new')

  const { data: couple } = await supabase
    .from('couples').select('level, exp').eq('id', coupleId).single()
  const { data: questDone } = await supabase
    .from('quest_completions').select('id').eq('couple_id', coupleId).eq('date', today).single()
  const { count: streak } = await supabase
    .from('quest_completions').select('id', { count: 'exact', head: true }).eq('couple_id', coupleId)

  const xpForNext = 100 + ((couple?.level ?? 1) - 1) * 150
  const relHealth = Math.min(100, Math.round(((couple?.exp ?? 0) / xpForNext) * 100))

  /* 파트너 대기 화면 */
  if (!partnerDiary) {
    return (
      <DeviceFrame relHealth={relHealth} xp={couple?.exp ?? 0} streak={streak ?? 0} nickname={profile?.nickname ?? ''}>
        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          <div style={{ animation: 'float-y 2s ease-in-out infinite', marginTop: 16 }}>
            <svg viewBox="0 0 36 32" width={52}>
              <path d="M18 30 C 4 22, 0 14, 0 9 C 0 3, 4 0, 9 0 C 13 0, 16 2, 18 5 C 20 2, 23 0, 27 0 C 32 0, 36 3, 36 9 C 36 14, 32 22, 18 30 Z" fill="#ffb6d0" stroke="#ff9ec5" strokeWidth="1.2" />
              <ellipse cx="9" cy="7" rx="3" ry="2" fill="#fff" opacity=".85" />
            </svg>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 6 }}>일기를 썼어요!</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
              파트너의 일기를 기다리는 중이에요.<br />둘 다 쓰면 오늘의 리포트가 완성돼요.
            </div>
          </div>
          <div style={{
            width: '100%', background: 'linear-gradient(135deg, #fff5fa, var(--p-100))',
            border: '1.5px solid var(--p-400)', borderRadius: 12,
            boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px var(--p-400)',
            padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            {[{ label: '나', done: true }, { label: '파트너', done: false }].map(({ label, done }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                <span style={{ fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
                <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700, background: done ? '#d4f0e2' : 'var(--p-100)', color: done ? '#2e6b4f' : 'var(--p-500)', border: `1px solid ${done ? '#7dcfa8' : 'var(--p-300)'}` }}>
                  {done ? '✓ 완료' : '기다리는 중…'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </DeviceFrame>
    )
  }

  await syncMonsters(supabase, coupleId)
  const { data: activeMonsters } = await supabase
    .from('monsters').select('type, hp, max_hp').eq('couple_id', coupleId).is('defeated_at', null)

  const report = await getOrGenerateReport(supabase, coupleId, user.id)

  if (!report) {
    return (
      <DeviceFrame relHealth={relHealth} xp={couple?.exp ?? 0} streak={streak ?? 0}>
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-2)', fontSize: 13, lineHeight: 1.7, paddingTop: 60 }}>
          리포트를 불러오는 중 오류가 발생했어요.<br />잠시 후 다시 시도해주세요.
        </div>
      </DeviceFrame>
    )
  }

  const { analysis } = report
  const risk = RISK_CONFIG[analysis.riskLevel]
  const detectedHorsemen = Object.entries(analysis.horsemen).filter(([, v]) => v)

  return (
    <DeviceFrame relHealth={relHealth} xp={couple?.exp ?? 0} streak={streak ?? 0} nickname={profile?.nickname ?? ''}>
      <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 위험도 카드 */}
        <div style={{ background: risk.bg, border: `1.5px solid ${risk.border}`, borderRadius: 14, boxShadow: `0 0 0 3px #fff, 0 0 0 4.5px ${risk.border}`, padding: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: risk.text, marginBottom: 6 }}>{risk.icon} {risk.label}</div>
          <div style={{ fontSize: 12, color: risk.text, lineHeight: 1.7, opacity: .85 }}>{analysis.message}</div>
        </div>

        {/* 감정 키워드 */}
        <div style={cardStyle}>
          <div style={{ background: 'linear-gradient(90deg, #ffd6e8, #ffb6d0)', color: 'var(--p-700)', padding: '6px 12px', borderBottom: '1.5px dashed var(--p-500)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
            ♡ 오늘의 감정 키워드
          </div>
          <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: '나', keywords: analysis.emotionKeywords.a, bg: 'var(--p-200)', color: 'var(--p-700)', border: 'var(--p-400)' },
              { label: '파트너', keywords: analysis.emotionKeywords.b, bg: 'var(--lavender)', color: '#5a45a0', border: 'var(--blue-2)' },
            ].map(({ label, keywords, bg, color, border }) => (
              <div key={label}>
                <div className="pixel" style={{ fontSize: 10, color, marginBottom: 6, fontWeight: 700 }}>{label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {keywords.map((k: string) => (
                    <span key={k} style={{ background: `linear-gradient(180deg, #fff, ${bg})`, color, border: `1.5px solid ${border}`, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700, boxShadow: `0 0 0 1.5px #fff, 0 0 0 2.5px ${border}`, textShadow: '1px 1px 0 #fff' }}>{k}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 온도 차이 */}
        {analysis.temperatureGap > 0 && (
          <div style={cardStyle}>
            <div style={{ background: 'linear-gradient(90deg, #ffd6e8, #ffb6d0)', color: 'var(--p-700)', padding: '6px 12px', borderBottom: '1.5px dashed var(--p-500)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
              ▸ 감정 온도 차이
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div className="screen" style={{ fontSize: 38, color: 'var(--p-600)', lineHeight: 1, marginBottom: 4 }}>{analysis.temperatureGap}°</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {analysis.temperatureGap <= 2 ? '두 분이 비슷한 온도를 느꼈어요 ♡' : '오늘 서로 다른 온도를 느꼈네요. 이야기 나눠봐요.'}
              </div>
            </div>
          </div>
        )}

        {/* 4독 감지 */}
        {detectedHorsemen.length > 0 && (
          <div style={cardStyle}>
            <div style={{ background: 'linear-gradient(90deg, var(--lavender), #c8dcff)', color: '#5a45a0', padding: '6px 12px', borderBottom: '1.5px dashed var(--blue-2)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
              ⚠ 감지된 신호
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {detectedHorsemen.map(([key]) => (
                <div key={key} style={{ background: 'linear-gradient(180deg, #fff, var(--lavender))', border: '1.5px solid var(--blue-2)', borderRadius: 10, boxShadow: '0 0 0 2px #fff, 0 0 0 3px var(--blue-2)', padding: '7px 10px', fontSize: 12, color: '#5a45a0', fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
                  ▸ {HORSEMEN_LABELS[key as keyof typeof HORSEMEN_LABELS]} 패턴이 감지됐어요
                </div>
              ))}
              {analysis.pursueWithdraw && (
                <div style={{ background: 'linear-gradient(180deg, #fff, var(--p-100))', border: '1.5px solid var(--p-400)', borderRadius: 10, boxShadow: '0 0 0 2px #fff, 0 0 0 3px var(--p-400)', padding: '7px 10px', fontSize: 12, color: 'var(--p-700)', fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
                  ↔ 추구-철수 패턴이 보여요
                </div>
              )}
            </div>
          </div>
        )}

        {/* 몬스터 */}
        {activeMonsters && activeMonsters.length > 0 && activeMonsters.map(m => (
          <MonsterCard key={m.type} type={m.type as MonsterType} hp={m.hp} maxHp={m.max_hp} />
        ))}

        {/* 퀘스트 */}
        <QuestButton coupleId={coupleId} questText={analysis.quest.text} questTheory={analysis.quest.theory} alreadyDone={!!questDone} />

        {/* 커플 레벨 */}
        {couple && (
          <div style={cardStyle}>
            <div style={{ background: 'linear-gradient(90deg, var(--lavender), #c8dcff)', color: '#5a45a0', padding: '6px 12px', borderBottom: '1.5px dashed var(--blue-2)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
              ✦ 커플 레벨
            </div>
            <div style={{ padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Lv.{couple.level}</span>
                <span className="screen" style={{ fontSize: 18, color: 'var(--p-600)' }}>{couple.exp} XP</span>
              </div>
              <PixelBar value={couple.exp} max={xpForNext} color="var(--lavender)" />
            </div>
          </div>
        )}
      </div>
    </DeviceFrame>
  )
}
