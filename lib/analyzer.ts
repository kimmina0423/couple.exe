import Anthropic from '@anthropic-ai/sdk'
import { ANALYZER_SYSTEM_PROMPT } from '@/prompts/analyzer_system'

const client = new Anthropic()

// ─── 입력 타입 ────────────────────────────────────────────────────────────────

export type DiaryEntry = {
  q1_moment: string | null
  q2_gratitude: string | null
  q3_conflict: string | null
  q4_mood: string | null
  q5_wish: string | null
  temperature: number | null
}

// history: 지난 14일 분석 결과. 패턴 학습용으로 analyzeCoupleDiary에 전달.
export type HistoryEntry = {
  date: string
  riskLevel: 'GREEN' | 'YELLOW' | 'RED'
  cycleDetected: boolean
  cycleType?: string
  userARoles?: string
  userBRoles?: string
  monsterType?: string | null
}

// ─── 출력 타입 ────────────────────────────────────────────────────────────────

export type UserAnalysis = {
  secondaryEmotions: string[]
  primaryEmotions: string[]
  attachmentLongings: string[]
  gottmanSignals: string[]
  role: 'withdrawer' | 'pursuer' | 'neutral'
  emotionalDepth: 'surface' | 'secondary' | 'primary'
  selfDisclosure: boolean
  positiveReference: boolean
}

export type CycleAnalysis = {
  detected: boolean
  type: 'pursuer-withdrawer' | 'mutual-withdrawal' | 'mutual-escalation' | 'none'
  consecutiveDays: number
  description: string
}

export type MonsterResult = {
  name: string
  theoreticalBasis: string
  weakness: string
  hp: number
}

export type QuestResult = {
  title: string
  instruction: string
  eftTechnique: '환기적 질문' | '반영' | '공감적 추측' | '애착 씨뿌리기' | '재연'
  expectedOutcome: string
  exp: number
}

export type AnalysisResult = {
  userA: UserAnalysis
  userB: UserAnalysis
  cycle: CycleAnalysis
  riskLevel: 'GREEN' | 'YELLOW' | 'RED'
  temperatureGap: number
  longingAlignment: 'aligned' | 'conflicted' | 'neutral'
  translationForA: string
  translationForB: string
  todayMonster: MonsterResult | null
  todayQuest: QuestResult | null
  safetyFlag: null | 'violence' | 'self_harm' | 'abuse'
  message: string
}

// ─── 일기 포맷 ────────────────────────────────────────────────────────────────

function formatEntry(label: string, entry: DiaryEntry): string {
  return `[${label}]
Q1 오늘 관계에서 가장 마음에 남은 순간 + 신체 감각: ${entry.q1_moment ?? '(없음)'}
Q2 표현하지 못하고 삼킨 감정: ${entry.q2_gratitude ?? '(없음)'}
Q3 파트너에게 듣고 싶었던 한 마디: ${entry.q3_conflict ?? '(없음)'}
Q4 파트너가 나를 "봐준다"고 느낀 순간 (없었다면 바랐던 순간): ${entry.q4_mood ?? '(없음)'}
Q5 관계 온도 + 이유: ${entry.q5_wish ?? '(없음)'}
온도 수치: ${entry.temperature ?? '(없음)'}°`
}

function formatHistory(history: HistoryEntry[]): string {
  if (!history.length) return '(이전 데이터 없음)'
  return history
    .slice(-14)
    .map(h =>
      `${h.date}: 위험도=${h.riskLevel}, 사이클=${h.cycleDetected ? h.cycleType : '없음'}, 몬스터=${h.monsterType ?? '없음'}`
    )
    .join('\n')
}

// ─── 메인 분석 함수 ───────────────────────────────────────────────────────────

export async function analyzeCoupleDiary(
  entryA: DiaryEntry,
  entryB: DiaryEntry,
  history: HistoryEntry[] = []
): Promise<AnalysisResult> {
  const USE_MOCK =
    !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === '나중에'
  if (USE_MOCK) return mockAnalysis(entryA, entryB, history)

  const userMessage = [
    formatEntry('파트너 A 일기', entryA),
    '',
    formatEntry('파트너 B 일기', entryB),
    '',
    '=== 지난 14일 패턴 히스토리 ===',
    formatHistory(history),
  ].join('\n')

  return callWithRetry(userMessage, 2)
}

async function callWithRetry(
  userMessage: string,
  retriesLeft: number
): Promise<AnalysisResult> {
  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: ANALYZER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('JSON not found in response')

    const parsed = JSON.parse(match[0]) as AnalysisResult
    return parsed
  } catch (err) {
    if (retriesLeft > 0) {
      await new Promise(r => setTimeout(r, 800))
      return callWithRetry(userMessage, retriesLeft - 1)
    }
    console.error('[analyzer] API failed after retries:', err)
    return mockAnalysis(
      { q1_moment: null, q2_gratitude: null, q3_conflict: null, q4_mood: null, q5_wish: null, temperature: 5 },
      { q1_moment: null, q2_gratitude: null, q3_conflict: null, q4_mood: null, q5_wish: null, temperature: 5 },
      []
    )
  }
}

// ─── Mock 분석 ────────────────────────────────────────────────────────────────

function mockAnalysis(
  entryA: DiaryEntry,
  entryB: DiaryEntry,
  history: HistoryEntry[]
): AnalysisResult {
  const tempA = entryA.temperature ?? 5
  const tempB = entryB.temperature ?? 5
  const gap = Math.abs(tempA - tempB)
  const avg = (tempA + tempB) / 2
  const riskLevel: 'GREEN' | 'YELLOW' | 'RED' =
    avg >= 7 ? 'GREEN' : avg >= 5 ? 'YELLOW' : 'RED'

  // history에서 연속 사이클 날 수 계산
  let consecutiveDays = 0
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].cycleDetected) consecutiveDays++
    else break
  }

  const moodA = entryA.q4_mood?.trim() || '평온함'
  const moodB = entryB.q4_mood?.trim() || '잔잔함'

  const baseUser: UserAnalysis = {
    secondaryEmotions: [],
    primaryEmotions: [],
    attachmentLongings: ['따뜻한 연결에 대한 갈망'],
    gottmanSignals: [],
    role: 'neutral',
    emotionalDepth: 'secondary',
    selfDisclosure: false,
    positiveReference: avg >= 6,
  }

  return {
    userA: {
      ...baseUser,
      secondaryEmotions: [moodA],
      primaryEmotions: avg < 5 ? ['외로움'] : ['따뜻함'],
    },
    userB: {
      ...baseUser,
      secondaryEmotions: [moodB],
      primaryEmotions: gap > 3 ? ['거절감'] : ['연결감'],
    },
    cycle: {
      detected: consecutiveDays >= 3,
      type: consecutiveDays >= 3 ? 'pursuer-withdrawer' : 'none',
      consecutiveDays,
      description:
        consecutiveDays >= 3
          ? '반복되는 소통 단절 패턴이 감지되고 있어요.'
          : '오늘은 특별한 부정 사이클이 보이지 않아요.',
    },
    riskLevel,
    temperatureGap: gap,
    longingAlignment: gap <= 2 ? 'aligned' : 'neutral',
    translationForA: `오늘 파트너에게는 겉으로는 ${moodB}한 마음이 있었던 것 같아요. 그 밑에는 당신과 더 가까워지고 싶은 마음이 있었을 거예요. 지금 파트너가 바라는 건 따뜻한 연결이에요.`,
    translationForB: `오늘 파트너에게는 겉으로는 ${moodA}한 마음이 있었던 것 같아요. 그 밑에는 당신에게 보여지고 싶은 마음이 있었을 거예요. 지금 파트너가 바라는 건 "내 이야기를 들어줬으면" 하는 마음이에요.`,
    todayMonster:
      riskLevel !== 'GREEN'
        ? {
            name: '침묵 괴물',
            theoreticalBasis: 'Gottman Stonewalling + EFT Withdrawal',
            weakness: '감정 한 문장 말하기',
            hp: 100,
          }
        : null,
    todayQuest: {
      title: '오늘 하루 감사 한 마디',
      instruction:
        '자기 전에 파트너에게 "오늘 ~해줘서 고마워"를 한 마디 전해보세요. 어떤 작은 것도 괜찮아요.',
      eftTechnique: '애착 씨뿌리기',
      expectedOutcome: '감정은행계좌 입금 + 긍정 연결 신호 생성',
      exp: 10,
    },
    safetyFlag: null,
    message:
      gap <= 2
        ? '오늘 두 사람의 마음이 비슷한 온도를 느꼈네요. 그 자체가 연결이에요.'
        : '서로 조금 다른 하루를 보낸 것 같아요. 오늘 여기서 만났다는 게 중요해요.',
  }
}
