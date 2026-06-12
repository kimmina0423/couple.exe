import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { analyzeCoupleDiary } from '@/lib/analyzer'
import { getCouplePatterns } from '@/lib/pattern_learner'
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

const cardStyle = {
  border: '1.5px solid var(--p-500)', borderRadius: 16,
  boxShadow: '0 0 0 3px #fff, 0 0 0 4.5px var(--p-500), 0 8px 14px -6px rgba(238,131,177,.4)',
  background: '#fff', overflow: 'hidden',
} as React.CSSProperties

async function getOrGenerateReport(
  supabase: Awaited<ReturnType<typeof createClient>>,
  coupleId: string,
  myId: string
): Promise<{ analysis: AnalysisResult; fromCache: boolean } | null> {
  const today = new Date().toISOString().split('T')[0]

  // 1) 캐시된 리포트 확인
  try {
    const { data: existing } = await supabase
      .from('daily_reports').select('analysis_json')
      .eq('couple_id', coupleId).eq('date', today).single()
    if (existing?.analysis_json) {
      return { analysis: existing.analysis_json as AnalysisResult, fromCache: true }
    }
  } catch { /* 없으면 신규 생성 */ }

  // 2) 두 사람 일기 조회
  let diaries: any[] | null = null
  try {
    const { data } = await supabase.rpc('get_couple_diaries', {
      couple_id_input: coupleId, date_input: today,
    })
    diaries = data
  } catch (e) {
    console.error('[report] get_couple_diaries failed:', e)
    return null
  }
  if (!diaries || diaries.length < 2) return null

  const myDiary      = diaries.find((d: any) => d.user_id === myId)
  const partnerDiary = diaries.find((d: any) => d.user_id !== myId)
  if (!myDiary || !partnerDiary) return null

  // 3) 14일 히스토리 (실패해도 빈 배열로 대체)
  let history: Awaited<ReturnType<typeof getCouplePatterns>>['recentHistory'] = []
  try {
    const patterns = await getCouplePatterns(coupleId)
    history = patterns.recentHistory
  } catch (e) {
    console.error('[report] getCouplePatterns failed, using empty history:', e)
  }

  // 4) AI 분석
  let analysis: AnalysisResult
  try {
    analysis = await analyzeCoupleDiary(myDiary, partnerDiary, history)
  } catch (e) {
    console.error('[report] analyzeCoupleDiary failed:', e)
    return null
  }

  // 5) 저장 (실패해도 분석 결과는 반환)
  try {
    await supabase.rpc('save_daily_report', {
      couple_id_input: coupleId,
      date_input: today,
      analysis: analysis,
      quest: analysis.todayQuest,
      monster: analysis.todayMonster,
    })
  } catch (e) {
    console.error('[report] save_daily_report failed:', e)
  }

  return { analysis, fromCache: false }
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
  const partnerWrote = (diaryCount ?? 0) >= 2

  if (!myDiary) redirect('/diary/new')

  const { data: couple } = await supabase
    .from('couples').select('level, exp').eq('id', coupleId).single()
  const { data: questDone } = await supabase
    .from('quest_completions').select('id').eq('couple_id', coupleId).eq('date', today).single()
  const { count: streak } = await supabase
    .from('quest_completions').select('id', { count: 'exact', head: true }).eq('couple_id', coupleId)

  const xpForNext = 100 + ((couple?.level ?? 1) - 1) * 150
  const relHealth = Math.min(100, Math.round(((couple?.exp ?? 0) / xpForNext) * 100))

  if (!partnerWrote) {
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
          <div style={{ width: '100%', background: 'linear-gradient(135deg, #fff5fa, var(--p-100))', border: '1.5px solid var(--p-400)', borderRadius: 12, boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px var(--p-400)', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
      <DeviceFrame relHealth={relHealth} xp={couple?.exp ?? 0} streak={streak ?? 0} nickname={profile?.nickname ?? ''}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', paddingTop: 40 }}>
          <div style={{ animation: 'float-y 2s ease-in-out infinite' }}>
            <svg viewBox="0 0 36 32" width={48}>
              <path d="M18 30 C 4 22, 0 14, 0 9 C 0 3, 4 0, 9 0 C 13 0, 16 2, 18 5 C 20 2, 23 0, 27 0 C 32 0, 36 3, 36 9 C 36 14, 32 22, 18 30 Z" fill="#c8dcff" stroke="#a0bfff" strokeWidth="1.2" />
            </svg>
          </div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>보고서를 만드는 중이에요</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.7 }}>
            AI가 두 사람의 일기를 분석하고 있어요.<br />
            페이지를 새로고침하면 확인할 수 있어요.
          </div>
          <a href="/today" style={{
            display: 'inline-block', marginTop: 4,
            background: 'linear-gradient(180deg, #ffc8de, #ff9ec5)',
            color: '#fff', border: '2px solid #ee83b1', borderRadius: 999,
            boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px #ee83b1',
            padding: '10px 24px', fontSize: 14,
            fontFamily: 'var(--font-round)', fontWeight: 700, textDecoration: 'none',
            textShadow: '1px 1px 0 rgba(238,131,177,.5)',
          }}>
            ♡ 새로고침
          </a>
        </div>
      </DeviceFrame>
    )
  }

  const { analysis } = report
  const risk = RISK_CONFIG[analysis.riskLevel ?? 'GREEN']

  // 감정 키워드: primaryEmotions (새 스키마) 또는 구버전 fallback
  const myEmotions = analysis.userA?.primaryEmotions
    ?? (analysis as any).emotionKeywords?.a
    ?? []
  const partnerEmotions = analysis.userB?.primaryEmotions
    ?? (analysis as any).emotionKeywords?.b
    ?? []

  // 4독 감지: gottmanSignals에서 추출 (구버전 horsemen 필드 fallback 포함)
  const allSignals = [
    ...(analysis.userA?.gottmanSignals ?? []),
    ...(analysis.userB?.gottmanSignals ?? []),
  ]
  const legacyHorsemen = (analysis as any).horsemen ?? {}
  const detectedSignals = allSignals.length > 0
    ? Array.from(new Set(allSignals))
    : Object.entries(legacyHorsemen).filter(([, v]) => v).map(([k]) => k)

  // 추구-철수: 새 스키마 cycle.detected, 구버전 pursueWithdraw fallback
  const cycleDetected = analysis.cycle?.detected ?? (analysis as any).pursueWithdraw ?? false

  // 퀘스트
  const questTitle = analysis.todayQuest?.title ?? (analysis as any).quest?.text ?? ''
  const questSub   = analysis.todayQuest?.instruction
    ?? analysis.todayQuest?.eftTechnique
    ?? (analysis as any).quest?.theory
    ?? ''

  // 정서 번역문
  const translationForMe = analysis.translationForA ?? null

  return (
    <DeviceFrame relHealth={relHealth} xp={couple?.exp ?? 0} streak={streak ?? 0} nickname={profile?.nickname ?? ''}>
      <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 위험도 카드 */}
        <div style={{ background: risk.bg, border: `1.5px solid ${risk.border}`, borderRadius: 14, boxShadow: `0 0 0 3px #fff, 0 0 0 4.5px ${risk.border}`, padding: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: risk.text, marginBottom: 6 }}>{risk.icon} {risk.label}</div>
          <div style={{ fontSize: 12, color: risk.text, lineHeight: 1.7, opacity: .85 }}>{analysis.message}</div>
        </div>

        {/* AI 정서 번역: 파트너 마음 */}
        {translationForMe && (
          <div style={{ ...cardStyle }}>
            <div style={{ background: 'linear-gradient(90deg, var(--lavender), #c8dcff)', color: '#5a45a0', padding: '6px 12px', borderBottom: '1.5px dashed var(--blue-2)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
              ♡ 파트너의 마음을 번역했어요
            </div>
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--ink)', lineHeight: 1.8, fontStyle: 'italic' }}>
              {translationForMe}
            </div>
          </div>
        )}

        {/* 감정 키워드 */}
        <div style={cardStyle}>
          <div style={{ background: 'linear-gradient(90deg, #ffd6e8, #ffb6d0)', color: 'var(--p-700)', padding: '6px 12px', borderBottom: '1.5px dashed var(--p-500)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
            ♡ 오늘의 감정 키워드
          </div>
          <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: '나', keywords: myEmotions,      bg: 'var(--p-200)',   color: 'var(--p-700)', border: 'var(--p-400)' },
              { label: '파트너', keywords: partnerEmotions, bg: 'var(--lavender)', color: '#5a45a0',    border: 'var(--blue-2)' },
            ].map(({ label, keywords, bg, color, border }) => (
              <div key={label}>
                <div className="pixel" style={{ fontSize: 10, color, marginBottom: 6, fontWeight: 700 }}>{label}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {(keywords as string[]).map((k: string) => (
                    <span key={k} style={{ background: `linear-gradient(180deg, #fff, ${bg})`, color, border: `1.5px solid ${border}`, borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700, boxShadow: `0 0 0 1.5px #fff, 0 0 0 2.5px ${border}`, textShadow: '1px 1px 0 #fff' }}>{k}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 온도 차이 */}
        {(analysis.temperatureGap ?? 0) > 0 && (
          <div style={cardStyle}>
            <div style={{ background: 'linear-gradient(90deg, #ffd6e8, #ffb6d0)', color: 'var(--p-700)', padding: '6px 12px', borderBottom: '1.5px dashed var(--p-500)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
              ▸ 감정 온도 차이
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div className="screen" style={{ fontSize: 38, color: 'var(--p-600)', lineHeight: 1, marginBottom: 4 }}>{analysis.temperatureGap}°</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {(analysis.temperatureGap ?? 0) <= 2 ? '두 분이 비슷한 온도를 느꼈어요 ♡' : '오늘 서로 다른 온도를 느꼈네요. 이야기 나눠봐요.'}
              </div>
            </div>
          </div>
        )}

        {/* 사이클 / 패턴 감지 */}
        {(detectedSignals.length > 0 || cycleDetected) && (
          <div style={cardStyle}>
            <div style={{ background: 'linear-gradient(90deg, var(--lavender), #c8dcff)', color: '#5a45a0', padding: '6px 12px', borderBottom: '1.5px dashed var(--blue-2)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
              ⚠ 감지된 신호
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {detectedSignals.map((signal: string) => (
                <div key={signal} style={{ background: 'linear-gradient(180deg, #fff, var(--lavender))', border: '1.5px solid var(--blue-2)', borderRadius: 10, boxShadow: '0 0 0 2px #fff, 0 0 0 3px var(--blue-2)', padding: '7px 10px', fontSize: 12, color: '#5a45a0', fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
                  ▸ {signal} 패턴이 감지됐어요
                </div>
              ))}
              {cycleDetected && (
                <div style={{ background: 'linear-gradient(180deg, #fff, var(--p-100))', border: '1.5px solid var(--p-400)', borderRadius: 10, boxShadow: '0 0 0 2px #fff, 0 0 0 3px var(--p-400)', padding: '7px 10px', fontSize: 12, color: 'var(--p-700)', fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
                  ↔ {analysis.cycle?.description ?? '추구-철수 패턴이 보여요'}
                  {(analysis.cycle?.consecutiveDays ?? 0) >= 7 && (
                    <div style={{ fontSize: 11, marginTop: 4, opacity: .8 }}>
                      ⚠ {analysis.cycle?.consecutiveDays}일째 지속 중이에요 — 같이 이 패턴을 깨봐요
                    </div>
                  )}
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
        {questTitle && (
          <QuestButton
            coupleId={coupleId}
            questText={questTitle}
            questTheory={questSub}
            alreadyDone={!!questDone}
          />
        )}

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
