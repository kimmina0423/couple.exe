import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { analyzeCoupleDiary } from '@/lib/analyzer'
import { syncMonsters } from '@/lib/monster'
import QuestButton from './QuestButton'
import MonsterCard from './MonsterCard'
import type { AnalysisResult } from '@/lib/analyzer'
import type { MonsterType } from '@/lib/monster'

const RISK_CONFIG = {
  GREEN: { label: '오늘 우리는 안정적이에요', color: 'bg-green-100 text-green-700', dot: '🟢' },
  YELLOW: { label: '조금 주의가 필요한 하루예요', color: 'bg-amber-100 text-amber-700', dot: '🟡' },
  RED: { label: '오늘 서로 힘들었던 것 같아요', color: 'bg-red-100 text-red-700', dot: '🔴' },
}

const HORSEMEN_LABELS = {
  criticism: '비난',
  defensiveness: '방어',
  contempt: '경멸',
  stonewalling: '담쌓기',
}

async function getOrGenerateReport(supabase: Awaited<ReturnType<typeof createClient>>, coupleId: string, myId: string) {
  const today = new Date().toISOString().split('T')[0]

  // 오늘 리포트 이미 있으면 바로 반환
  const { data: existing } = await supabase
    .from('daily_reports')
    .select('analysis_json, quest_json')
    .eq('couple_id', coupleId)
    .eq('date', today)
    .single()

  if (existing) {
    return {
      analysis: existing.analysis_json as AnalysisResult,
      quest: existing.quest_json as AnalysisResult['quest'],
    }
  }

  // 두 사람 일기 읽기 (RPC로 RLS 우회)
  const { data: diaries } = await supabase
    .rpc('get_couple_diaries', {
      couple_id_input: coupleId,
      date_input: today,
    })

  if (!diaries || diaries.length < 2) return null

  const myDiary = diaries.find((d: any) => d.user_id === myId)
  const partnerDiary = diaries.find((d: any) => d.user_id !== myId)
  if (!myDiary || !partnerDiary) return null

  // Claude 분석 호출
  const analysis = await analyzeCoupleDiary(myDiary, partnerDiary)

  // 리포트 저장 (RPC로 RLS 우회)
  await supabase.rpc('save_daily_report', {
    couple_id_input: coupleId,
    date_input: today,
    analysis: analysis,
    quest: analysis.quest,
    monster: analysis.monster,
  })

  return { analysis, quest: analysis.quest }
}

export default async function TodayPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  // 내 프로필 + 커플 정보
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6 text-center space-y-4">
        <p className="text-2xl">💑</p>
        <p className="text-gray-600">파트너와 연결되지 않았어요.</p>
        <Link href="/home" className="text-rose-400 font-medium text-sm">홈으로</Link>
      </div>
    )
  }

  const coupleId = profile.couple_id

  // 내 일기
  const { data: myDiary } = await supabase
    .from('diary_entries')
    .select('id')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  // 커플 전체 일기 제출 수 (RPC로 RLS 우회)
  const { data: diaryCount } = await supabase
    .rpc('count_couple_diaries', {
      couple_id_input: coupleId,
      date_input: today,
    })
  const partnerDiary = (diaryCount ?? 0) >= 2

  // 내가 아직 안 썼으면 일기 페이지로
  if (!myDiary) redirect('/diary/new')

  // 커플 레벨/경험치
  const { data: couple } = await supabase
    .from('couples')
    .select('level, exp')
    .eq('id', coupleId)
    .single()

  // 퀘스트 완료 여부
  const { data: questDone } = await supabase
    .from('quest_completions')
    .select('id')
    .eq('couple_id', coupleId)
    .eq('date', today)
    .single()

  // 파트너가 아직 안 썼으면 대기 화면
  if (!partnerDiary) {
    return (
      <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6 text-center space-y-6">
        <div className="text-6xl animate-pulse">💌</div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-800">일기를 썼어요!</h2>
          <p className="text-gray-500 text-sm">파트너의 일기를 기다리는 중이에요.<br />둘 다 쓰면 오늘의 리포트가 완성돼요.</p>
        </div>
        <div className="bg-white rounded-3xl shadow-sm px-6 py-4 text-sm text-gray-500 w-full max-w-xs">
          <div className="flex justify-between">
            <span>나</span>
            <span className="text-green-500 font-medium">✓ 완료</span>
          </div>
          <div className="flex justify-between mt-2">
            <span>파트너</span>
            <span className="text-gray-300">기다리는 중...</span>
          </div>
        </div>
        <Link href="/home" className="text-rose-400 font-medium text-sm">홈으로</Link>
      </div>
    )
  }

  // 7일치 분석 기반 몬스터 싱크 (등장/처치 판정)
  await syncMonsters(supabase, coupleId)

  // 활성 몬스터 조회
  const { data: activeMonsters } = await supabase
    .from('monsters')
    .select('type, hp, max_hp')
    .eq('couple_id', coupleId)
    .is('defeated_at', null)

  // 둘 다 썼으면 리포트 생성/조회
  const report = await getOrGenerateReport(supabase, coupleId, user.id)

  if (!report) {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center px-6">
        <p className="text-gray-400 text-sm text-center">리포트를 불러오는 중 오류가 발생했어요.<br />잠시 후 다시 시도해주세요.</p>
      </div>
    )
  }

  const { analysis } = report
  const risk = RISK_CONFIG[analysis.riskLevel]
  const detectedHorsemen = Object.entries(analysis.horsemen).filter(([, v]) => v)
  const xpForNext = 100 + ((couple?.level ?? 1) - 1) * 150

  return (
    <div className="min-h-screen bg-rose-50 pb-12">
      {/* 헤더 */}
      <div className="px-5 pt-8 pb-4 flex items-center justify-between">
        <Link href="/home" className="text-rose-400 text-sm">← 홈</Link>
        <span className="text-sm text-gray-400">오늘의 리포트</span>
        <div className="w-10" />
      </div>

      <div className="px-5 space-y-4">
        {/* 위험도 뱃지 */}
        <div className={`rounded-3xl p-5 ${risk.color}`}>
          <p className="text-lg font-bold">{risk.dot} {risk.label}</p>
          <p className="mt-2 text-sm leading-relaxed opacity-80">{analysis.message}</p>
        </div>

        {/* 감정 키워드 */}
        <div className="bg-white rounded-3xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-500 mb-3">오늘의 감정</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-2">나</p>
              <div className="flex flex-wrap gap-1">
                {analysis.emotionKeywords.a.map(k => (
                  <span key={k} className="bg-rose-100 text-rose-600 text-xs rounded-full px-2 py-1">{k}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-2">파트너</p>
              <div className="flex flex-wrap gap-1">
                {analysis.emotionKeywords.b.map(k => (
                  <span key={k} className="bg-violet-100 text-violet-600 text-xs rounded-full px-2 py-1">{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 온도 차이 */}
        {analysis.temperatureGap > 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-500 mb-1">감정 온도 차이</h3>
            <p className="text-3xl font-bold text-rose-400">{analysis.temperatureGap}°</p>
            <p className="text-xs text-gray-400 mt-1">
              {analysis.temperatureGap <= 2 ? '두 분이 비슷한 온도를 느꼈어요 🌡️' : '오늘 서로 다른 온도를 느꼈네요.'}
            </p>
          </div>
        )}

        {/* 4독 감지 */}
        {detectedHorsemen.length > 0 && (
          <div className="bg-white rounded-3xl shadow-sm p-5 space-y-2">
            <h3 className="text-sm font-semibold text-gray-500">감지된 신호</h3>
            {detectedHorsemen.map(([key]) => (
              <div key={key} className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-2xl px-3 py-2">
                <span>⚠️</span>
                <span>{HORSEMEN_LABELS[key as keyof typeof HORSEMEN_LABELS]} 패턴이 감지됐어요</span>
              </div>
            ))}
            {analysis.pursueWithdraw && (
              <div className="flex items-center gap-2 text-sm text-violet-700 bg-violet-50 rounded-2xl px-3 py-2">
                <span>↔️</span>
                <span>추구-철수 패턴이 보여요</span>
              </div>
            )}
          </div>
        )}

        {/* 몬스터 (7일치 누적 기반) */}
        {activeMonsters && activeMonsters.length > 0 && (
          <div className="space-y-3">
            {activeMonsters.map(m => (
              <MonsterCard
                key={m.type}
                type={m.type as MonsterType}
                hp={m.hp}
                maxHp={m.max_hp}
              />
            ))}
          </div>
        )}

        {/* 퀘스트 */}
        <QuestButton
          coupleId={coupleId}
          questText={analysis.quest.text}
          questTheory={analysis.quest.theory}
          alreadyDone={!!questDone}
        />

        {/* 커플 레벨 */}
        {couple && (
          <div className="bg-white rounded-3xl shadow-sm p-5 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-500">커플 레벨</h3>
              <span className="text-rose-500 font-bold">Lv.{couple.level}</span>
            </div>
            <div className="w-full bg-rose-100 rounded-full h-2">
              <div
                className="bg-rose-400 h-2 rounded-full transition-all"
                style={{ width: `${Math.min((couple.exp / xpForNext) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 text-right">{couple.exp} / {xpForNext} XP</p>
          </div>
        )}
      </div>
    </div>
  )
}
