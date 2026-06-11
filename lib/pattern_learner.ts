import { createClient } from '@/lib/supabase/server'
import type { AnalysisResult, HistoryEntry } from '@/lib/analyzer'

// ─── 출력 타입 ────────────────────────────────────────────────────────────────

export type EmotionFrequency = {
  emotion: string
  count: number
  ratio: number  // 0~1, 14일 중 몇 일 출현
}

export type CycleSummary = {
  totalDetectedDays: number
  consecutiveDaysNow: number    // 현재 진행 중인 연속 일수
  longestStreak: number         // 14일 중 가장 긴 연속 일수
  dominantType: string | null   // 가장 많이 나온 사이클 유형
}

export type MonsterStats = {
  type: string
  totalAppearances: number
  defeatedCount: number
  currentHp: number | null      // 현재 active 몬스터의 HP
}

export type LongingSatisfactionRate = {
  totalLongingsExpressed: number
  questCompletedDays: number
  satisfactionRatio: number     // 0~1, 갈망 표현 후 퀘스트 완료 비율
}

export type CouplePatternSummary = {
  coupleId: string
  analyzedDays: number          // 실제 분석된 일 수 (최대 14)
  userAPrimaryEmotions: EmotionFrequency[]
  userBPrimaryEmotions: EmotionFrequency[]
  userAAttachmentLongings: EmotionFrequency[]
  userBAttachmentLongings: EmotionFrequency[]
  cycle: CycleSummary
  monsters: MonsterStats[]
  longingSatisfaction: LongingSatisfactionRate
  recentHistory: HistoryEntry[] // analyzer.ts의 history 파라미터에 그대로 전달
}

// ─── 헬퍼 ────────────────────────────────────────────────────────────────────

function frequencyOf(items: string[][]): EmotionFrequency[] {
  const counts: Record<string, number> = {}
  const total = items.length

  for (const dayItems of items) {
    const seen = new Set<string>()
    for (const item of dayItems) {
      if (item && !seen.has(item)) {
        counts[item] = (counts[item] ?? 0) + 1
        seen.add(item)
      }
    }
  }

  return Object.entries(counts)
    .map(([emotion, count]) => ({ emotion, count, ratio: count / total }))
    .sort((a, b) => b.count - a.count)
}

function computeCycleSummary(reports: AnalysisResult[]): CycleSummary {
  let consecutiveDaysNow = 0
  let longestStreak = 0
  let currentStreak = 0
  const typeCounts: Record<string, number> = {}

  for (let i = 0; i < reports.length; i++) {
    const r = reports[i]
    if (r.cycle.detected) {
      currentStreak++
      longestStreak = Math.max(longestStreak, currentStreak)
      const t = r.cycle.type
      typeCounts[t] = (typeCounts[t] ?? 0) + 1
    } else {
      currentStreak = 0
    }
  }

  // consecutiveDaysNow: 마지막부터 연속으로 detected인 날 수
  for (let i = reports.length - 1; i >= 0; i--) {
    if (reports[i].cycle.detected) consecutiveDaysNow++
    else break
  }

  const dominantType =
    Object.keys(typeCounts).length > 0
      ? Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0][0]
      : null

  return {
    totalDetectedDays: reports.filter(r => r.cycle.detected).length,
    consecutiveDaysNow,
    longestStreak,
    dominantType,
  }
}

function computeMonsterStats(reports: AnalysisResult[]): MonsterStats[] {
  const stats: Record<string, { appearances: number; defeated: number }> = {}

  for (const r of reports) {
    if (!r.todayMonster) continue
    const name = r.todayMonster.name
    if (!stats[name]) stats[name] = { appearances: 0, defeated: 0 }
    stats[name].appearances++
  }

  return Object.entries(stats).map(([type, s]) => ({
    type,
    totalAppearances: s.appearances,
    defeatedCount: s.defeated,
    currentHp: null,  // 실시간 HP는 monsters 테이블에서 별도 조회
  }))
}

// ─── 메인 함수 ────────────────────────────────────────────────────────────────

export async function getCouplePatterns(coupleId: string): Promise<CouplePatternSummary> {
  const supabase = createClient()

  // 지난 14일 daily_reports 조회
  const since = new Date()
  since.setDate(since.getDate() - 14)
  const sinceStr = since.toISOString().split('T')[0]

  const { data: rows, error } = await supabase
    .from('daily_reports')
    .select('date, analysis_json, quest_json')
    .eq('couple_id', coupleId)
    .gte('date', sinceStr)
    .order('date', { ascending: true })

  if (error || !rows || rows.length === 0) {
    return emptyPatternSummary(coupleId)
  }

  // analysis_json 파싱
  const reports: AnalysisResult[] = []
  const dates: string[] = []

  for (const row of rows) {
    try {
      const parsed = typeof row.analysis_json === 'string'
        ? JSON.parse(row.analysis_json)
        : row.analysis_json
      if (parsed) {
        reports.push(parsed as AnalysisResult)
        dates.push(row.date)
      }
    } catch {
      // 파싱 실패한 날은 건너뜀
    }
  }

  if (reports.length === 0) return emptyPatternSummary(coupleId)

  // 퀘스트 완료 날 수 조회 (quest_completions 테이블)
  const { count: questCompletedDays } = await supabase
    .from('quest_completions')
    .select('id', { count: 'exact', head: true })
    .eq('couple_id', coupleId)
    .gte('created_at', since.toISOString())

  // 일차 정서 빈도 계산
  const userAPrimaryEmotions = frequencyOf(reports.map(r => r.userA?.primaryEmotions ?? []))
  const userBPrimaryEmotions = frequencyOf(reports.map(r => r.userB?.primaryEmotions ?? []))

  // 애착 갈망 빈도 계산
  const userAAttachmentLongings = frequencyOf(reports.map(r => r.userA?.attachmentLongings ?? []))
  const userBAttachmentLongings = frequencyOf(reports.map(r => r.userB?.attachmentLongings ?? []))

  // 갈망 충족도: 갈망이 감지된 날 / 퀘스트 완료된 날
  const daysWithLongings = reports.filter(
    r => (r.userA?.attachmentLongings?.length ?? 0) + (r.userB?.attachmentLongings?.length ?? 0) > 0
  ).length

  const satisfactionRatio = daysWithLongings > 0
    ? Math.min(1, (questCompletedDays ?? 0) / daysWithLongings)
    : 0

  // HistoryEntry 배열 구성 (analyzer.ts history 파라미터용)
  const recentHistory: HistoryEntry[] = reports.map((r, i) => ({
    date: dates[i],
    riskLevel: r.riskLevel,
    cycleDetected: r.cycle?.detected ?? false,
    cycleType: r.cycle?.type,
    userARoles: r.userA?.role,
    userBRoles: r.userB?.role,
    monsterType: r.todayMonster?.name ?? null,
  }))

  return {
    coupleId,
    analyzedDays: reports.length,
    userAPrimaryEmotions,
    userBPrimaryEmotions,
    userAAttachmentLongings,
    userBAttachmentLongings,
    cycle: computeCycleSummary(reports),
    monsters: computeMonsterStats(reports),
    longingSatisfaction: {
      totalLongingsExpressed: daysWithLongings,
      questCompletedDays: questCompletedDays ?? 0,
      satisfactionRatio,
    },
    recentHistory,
  }
}

// ─── 빈 결과 ─────────────────────────────────────────────────────────────────

function emptyPatternSummary(coupleId: string): CouplePatternSummary {
  return {
    coupleId,
    analyzedDays: 0,
    userAPrimaryEmotions: [],
    userBPrimaryEmotions: [],
    userAAttachmentLongings: [],
    userBAttachmentLongings: [],
    cycle: {
      totalDetectedDays: 0,
      consecutiveDaysNow: 0,
      longestStreak: 0,
      dominantType: null,
    },
    monsters: [],
    longingSatisfaction: {
      totalLongingsExpressed: 0,
      questCompletedDays: 0,
      satisfactionRatio: 0,
    },
    recentHistory: [],
  }
}
