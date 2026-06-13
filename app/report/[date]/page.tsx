import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DeviceFrame from '@/components/DeviceFrame'
import type { AnalysisResult } from '@/lib/analyzer'

const RISK_CONFIG = {
  GREEN:  { label: '안정적인 하루였어요',          bg: '#d4f0e2', border: '#7dcfa8', text: '#2e6b4f', icon: '✦' },
  YELLOW: { label: '조금 주의가 필요했던 하루예요', bg: 'var(--lavender)', border: 'var(--blue-2)', text: '#5a45a0', icon: '▸' },
  RED:    { label: '서로 힘들었던 하루였어요',      bg: 'var(--p-200)', border: 'var(--p-500)', text: 'var(--p-700)', icon: '⚠' },
}

const cardStyle = {
  border: '1.5px solid var(--p-500)', borderRadius: 16,
  boxShadow: '0 0 0 3px #fff, 0 0 0 4.5px var(--p-500), 0 8px 14px -6px rgba(238,131,177,.4)',
  background: '#fff', overflow: 'hidden',
} as React.CSSProperties

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

export default async function ReportPage({ params }: { params: { date: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('nickname, couple_id').eq('id', user.id).single()

  if (!profile?.couple_id) redirect('/home')

  const { data: reportRow } = await supabase
    .from('daily_reports')
    .select('analysis_json, created_at')
    .eq('couple_id', profile.couple_id)
    .eq('date', params.date)
    .single()

  const { data: couple } = await supabase
    .from('couples').select('level, exp').eq('id', profile.couple_id).single()

  const xpForNext = 100 + ((couple?.level ?? 1) - 1) * 150

  if (!reportRow?.analysis_json) {
    return (
      <DeviceFrame nickname={profile.nickname ?? ''} xp={couple?.exp ?? 0}>
        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', paddingTop: 40 }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>{formatDate(params.date)} 보고서가 없어요</div>
          <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>두 사람 모두 일기를 써야 보고서가 생성돼요.</div>
          <Link href="/today" style={{ color: 'var(--p-600)', fontWeight: 700, fontSize: 13, textDecoration: 'none' }}>← 오늘로 돌아가기</Link>
        </div>
      </DeviceFrame>
    )
  }

  const analysis = reportRow.analysis_json as AnalysisResult
  const risk = RISK_CONFIG[analysis.riskLevel ?? 'GREEN']

  const myEmotions = analysis.userA?.primaryEmotions ?? (analysis as any).emotionKeywords?.a ?? []
  const partnerEmotions = analysis.userB?.primaryEmotions ?? (analysis as any).emotionKeywords?.b ?? []

  const allSignals = [
    ...(analysis.userA?.gottmanSignals ?? []),
    ...(analysis.userB?.gottmanSignals ?? []),
  ]
  const legacyHorsemen = (analysis as any).horsemen ?? {}
  const detectedSignals = allSignals.length > 0
    ? Array.from(new Set(allSignals))
    : Object.entries(legacyHorsemen).filter(([, v]) => v).map(([k]) => k)

  const cycleDetected = analysis.cycle?.detected ?? (analysis as any).pursueWithdraw ?? false
  const translationForMe = analysis.translationForA ?? null
  const questTitle = analysis.todayQuest?.title ?? (analysis as any).quest?.text ?? ''
  const questSub = analysis.todayQuest?.instruction ?? (analysis as any).quest?.theory ?? ''

  return (
    <DeviceFrame nickname={profile.nickname ?? ''} xp={couple?.exp ?? 0}>
      <div style={{ padding: '14px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* 날짜 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/today" style={{ fontSize: 12, color: 'var(--p-600)', fontWeight: 700, textDecoration: 'none' }}>
            ← 오늘로
          </Link>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--font-round)' }}>
            {formatDate(params.date)} 보고서
          </div>
          <div style={{ width: 48 }} />
        </div>

        {/* 위험도 카드 */}
        <div style={{ background: risk.bg, border: `1.5px solid ${risk.border}`, borderRadius: 14, boxShadow: `0 0 0 3px #fff, 0 0 0 4.5px ${risk.border}`, padding: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: risk.text, marginBottom: 6 }}>{risk.icon} {risk.label}</div>
          <div style={{ fontSize: 12, color: risk.text, lineHeight: 1.7, opacity: .85 }}>{analysis.message}</div>
        </div>

        {/* AI 정서 번역 */}
        {translationForMe && (
          <div style={cardStyle}>
            <div style={{ background: 'linear-gradient(90deg, var(--lavender), #c8dcff)', color: '#5a45a0', padding: '6px 12px', borderBottom: '1.5px dashed var(--blue-2)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
              ♡ 파트너의 마음을 번역했어요
            </div>
            <div style={{ padding: '12px 14px', fontSize: 13, color: 'var(--ink)', lineHeight: 1.8, fontStyle: 'italic' }}>
              {translationForMe}
            </div>
          </div>
        )}

        {/* 감정 키워드 */}
        {(myEmotions.length > 0 || partnerEmotions.length > 0) && (
          <div style={cardStyle}>
            <div style={{ background: 'linear-gradient(90deg, #ffd6e8, #ffb6d0)', color: 'var(--p-700)', padding: '6px 12px', borderBottom: '1.5px dashed var(--p-500)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
              ♡ 그날의 감정 키워드
            </div>
            <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: '나', keywords: myEmotions, bg: 'var(--p-200)', color: 'var(--p-700)', border: 'var(--p-400)' },
                { label: '파트너', keywords: partnerEmotions, bg: 'var(--lavender)', color: '#5a45a0', border: 'var(--blue-2)' },
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
        )}

        {/* 온도 차이 */}
        {(analysis.temperatureGap ?? 0) > 0 && (
          <div style={cardStyle}>
            <div style={{ background: 'linear-gradient(90deg, #ffd6e8, #ffb6d0)', color: 'var(--p-700)', padding: '6px 12px', borderBottom: '1.5px dashed var(--p-500)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
              ▸ 감정 온도 차이
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div className="screen" style={{ fontSize: 38, color: 'var(--p-600)', lineHeight: 1, marginBottom: 4 }}>{analysis.temperatureGap}°</div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                {(analysis.temperatureGap ?? 0) <= 2 ? '두 분이 비슷한 온도를 느꼈어요 ♡' : '서로 다른 온도를 느낀 하루였네요.'}
              </div>
            </div>
          </div>
        )}

        {/* 감지된 신호 */}
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
                </div>
              )}
            </div>
          </div>
        )}

        {/* 그날의 퀘스트 (완료 버튼 없이 읽기 전용) */}
        {questTitle && (
          <div style={{ ...cardStyle, opacity: .85 }}>
            <div style={{ background: 'linear-gradient(90deg, #ffd6e8, #ffb6d0)', color: 'var(--p-700)', padding: '6px 12px', borderBottom: '1.5px dashed var(--p-500)', fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff' }}>
              ✦ 그날의 퀘스트
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', marginBottom: 6 }}>{questTitle}</div>
              {questSub && <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>{questSub}</div>}
            </div>
          </div>
        )}

        {/* 하단 네비 */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingTop: 4, paddingBottom: 8 }}>
          <Link href="/today" style={{
            background: 'linear-gradient(180deg, #ffc8de, #ff9ec5)',
            color: '#fff', border: '2px solid #ee83b1', borderRadius: 999,
            boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px #ee83b1',
            padding: '10px 24px', fontSize: 13,
            fontFamily: 'var(--font-round)', fontWeight: 700, textDecoration: 'none',
          }}>
            오늘 보고서 보기
          </Link>
        </div>

      </div>
    </DeviceFrame>
  )
}
