import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export type DiaryEntry = {
  q1_moment: string | null
  q2_gratitude: string | null
  q3_conflict: string | null
  q4_mood: string | null
  q5_wish: string | null
  temperature: number | null
}

export type Horsemen = {
  criticism: boolean    // 비난
  defensiveness: boolean // 방어
  contempt: boolean     // 경멸 (이혼 예측력 최고 — 즉시 RED)
  stonewalling: boolean // 담쌓기
}

export type Monster = {
  type: 'SILENCE' | 'CRITICISM'
  reason: string
}

export type Quest = {
  text: string
  theory: string  // 어떤 이론 근거로 제시했는지
}

export type AnalysisResult = {
  riskLevel: 'GREEN' | 'YELLOW' | 'RED'
  emotionKeywords: {
    a: string[]  // A 감정 키워드
    b: string[]  // B 감정 키워드
  }
  temperatureGap: number  // 온도 차이 절댓값
  horsemen: Horsemen
  pursueWithdraw: boolean  // 추구-철수 패턴 여부
  quest: Quest
  monster: Monster | null
  message: string  // 오늘의 공감 메시지 (1~2문장)
}

const SYSTEM_PROMPT = `당신은 가트만 심리학(Gottman Method) 기반의 커플 관계 분석 전문가입니다.
두 사람이 각자 쓴 하루 일기를 읽고 관계 신호를 분석합니다.

## 분석 기준

### 4가지 독 (Four Horsemen) 감지
- 비난(Criticism): "항상", "매번", "결국 너는", "왜 그렇게" 같은 인격 단정·절대화 표현
- 방어(Defensiveness): "나는 그런 거 아니었는데", "네가 먼저", "나만 잘못한", "맞아 하지만" 같은 책임 회피
- 경멸(Contempt): "한심해", "어이없어", "어차피 말해봤자", "그러면 그렇지" 같은 냉소·비웃음 → 이혼 예측력 최고, 발견 시 즉시 RED
- 담쌓기(Stonewalling): "말하기 싫었다", "대화가 의미없다", "혼자 있고 싶었다" 같은 철수·단절

### 위험도 기준
- GREEN: 긍정 표현이 부정의 5배 이상 (가트만 5:1 법칙)
- YELLOW: 긍정/부정 비율 2~4배, 또는 비난·방어·담쌓기 중 하나 감지
- RED: 비율 2배 미만, 또는 경멸 감지 시 즉시

### 추구-철수 패턴
한 사람은 대화·연결을 원하는데 다른 사람은 회피·단절하는 패턴.
A가 갈등을 언급하고 B가 담쌓기를 언급하면 해당.

### 퀘스트 선택 기준
- 비난 감지 → "부드러운 시작으로 대화 걸기" (Gentle Start-Up)
- 담쌓기 감지 → "10분 함께 산책하기" (자기진정 후 재연결)
- 추구-철수 패턴 → "5분 타이머 켜고 서로 말하기" (구조화된 대화)
- 긍정 신호 강함 → "오늘 칭찬 3번 전하기" (감정은행계좌 입금)
- 기본 → "5분 눈 마주치며 하루 이야기 나누기"

### 관계 몬스터 등장 조건
- SILENCE(침묵 괴물): 담쌓기 감지, 또는 추구-철수 패턴
- CRITICISM(비난 드래곤): 비난 또는 경멸 감지

## 출력 형식
반드시 아래 JSON만 출력하세요. 설명, 마크다운, 코드블록 없이 JSON 객체만.

{
  "riskLevel": "GREEN" | "YELLOW" | "RED",
  "emotionKeywords": {
    "a": ["키워드1", "키워드2"],
    "b": ["키워드1", "키워드2"]
  },
  "temperatureGap": 숫자,
  "horsemen": {
    "criticism": true | false,
    "defensiveness": true | false,
    "contempt": true | false,
    "stonewalling": true | false
  },
  "pursueWithdraw": true | false,
  "quest": {
    "text": "퀘스트 내용",
    "theory": "이론 근거 한 줄"
  },
  "monster": null 또는 { "type": "SILENCE" | "CRITICISM", "reason": "한 줄 이유" },
  "message": "오늘 두 사람에게 전하는 따뜻한 공감 메시지 1~2문장"
}`

function formatEntry(label: string, entry: DiaryEntry): string {
  return `[${label}]
Q1 오늘 기억에 남는 순간: ${entry.q1_moment ?? '(없음)'}
Q2 고마웠던 점: ${entry.q2_gratitude ?? '(없음)'}
Q3 어긋났거나 속상했던 일: ${entry.q3_conflict ?? '(없음)'}
Q4 지금 감정 한 단어: ${entry.q4_mood ?? '(없음)'}
Q5 내일 해주고 싶은 것: ${entry.q5_wish ?? '(없음)'}
관계 온도: ${entry.temperature ?? '(없음)'}°`
}

export async function analyzeCoupleDiary(
  entryA: DiaryEntry,
  entryB: DiaryEntry
): Promise<AnalysisResult> {
  const USE_MOCK = !process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === '나중에'
  if (USE_MOCK) return mockAnalysis(entryA, entryB)

  const userMessage = `${formatEntry('파트너 A 일기', entryA)}\n\n${formatEntry('파트너 B 일기', entryB)}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('JSON not found')
    return JSON.parse(match[0]) as AnalysisResult
  } catch {
    return mockAnalysis(entryA, entryB)
  }
}

function mockAnalysis(entryA: DiaryEntry, entryB: DiaryEntry): AnalysisResult {
  const gap = Math.abs((entryA.temperature ?? 5) - (entryB.temperature ?? 5))
  const avgTemp = ((entryA.temperature ?? 5) + (entryB.temperature ?? 5)) / 2
  const riskLevel = avgTemp >= 7 ? 'GREEN' : avgTemp >= 5 ? 'YELLOW' : 'RED'
  const moodA = entryA.q4_mood?.trim() || '평온함'
  const moodB = entryB.q4_mood?.trim() || '잔잔함'

  return {
    riskLevel,
    emotionKeywords: {
      a: [moodA, avgTemp >= 6 ? '따뜻함' : '피곤함'],
      b: [moodB, gap <= 2 ? '안정적' : '복잡함'],
    },
    temperatureGap: gap,
    horsemen: { criticism: false, defensiveness: false, contempt: false, stonewalling: false },
    pursueWithdraw: false,
    quest: {
      text: '오늘 잠들기 전 "오늘 하루 고마웠어" 한 마디 전하기',
      theory: '가트만: 감사 표현은 감정은행계좌의 가장 확실한 입금이에요.',
    },
    monster: null,
    message: gap <= 2
      ? '비슷한 온도를 느꼈네요. 오늘 꽤 잘 맞았던 것 같아요 🌡️'
      : '서로 조금 다른 하루를 보냈지만, 여기서 만났다는 게 중요해요.',
  }
}
