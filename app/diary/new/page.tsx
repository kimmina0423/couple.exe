'use client'

import { useState } from 'react'
import { saveDiary, type DiaryInput } from '@/app/actions/diary'
import { PixelHeart, PxButton, StickerBadge } from '@/components/y2k'
import DeviceFrame from '@/components/DeviceFrame'

const STEPS = [
  { key: 'q1_moment' as const,   question: '오늘 파트너와 나눈\n가장 기억에 남는 순간은?', placeholder: '작은 것도 괜찮아요.', type: 'textarea' },
  { key: 'q2_gratitude' as const, question: '오늘 파트너에게\n고마웠던 점이 있었나요?',    placeholder: '없었어도 괜찮아요.', type: 'textarea' },
  { key: 'q3_conflict' as const,  question: '오늘 서로 어긋났거나\n속상했던 일이 있었나요?', placeholder: '없었다면 "없었어요"라고 적어도 돼요.', type: 'textarea' },
  { key: 'q4_mood' as const,      question: '지금 나의 감정 상태를\n한 단어로 표현하면?',   placeholder: '예: 따뜻함, 피곤함, 설렘, 섭섭함…', type: 'textarea' },
  { key: 'q5_wish' as const,      question: '내일 파트너에게\n해주고 싶은 것이 있다면?',   placeholder: '작은 바람도 좋아요.', type: 'textarea' },
  { key: 'temperature' as const,  question: '오늘 우리 관계의 온도는\n몇 도인가요?',       placeholder: '', type: 'slider' },
]

const MOODS = [
  { e: '(>_<)', lab: '최악' }, { e: '(._.)', lab: '별로' }, { e: '(o_o)', lab: '그저' },
  { e: '(^_^)', lab: '좋아' }, { e: '(♡w♡)', lab: '최고' },
]

const TEMP_LABELS: Record<number, string> = {
  1: '🥶 너무 차가워요', 2: '😶 많이 멀어진 느낌', 3: '😔 좀 어색해요', 4: '😐 평범한 하루',
  5: '🙂 그럭저럭 괜찮아요', 6: '😊 좀 따뜻한 하루', 7: '😄 꽤 좋은 하루',
  8: '🥰 많이 가까웠어요', 9: '💕 정말 따뜻했어요', 10: '🔥 완벽한 하루',
}

export default function DiaryNewPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<DiaryInput>>({ temperature: 5 })
  const [mood, setMood] = useState(2)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const segs = 6
  const filled = Math.round(((step + 1) / STEPS.length) * segs)

  function handleChange(value: string | number) {
    setAnswers(prev => ({ ...prev, [current.key]: value }))
  }

  async function handleSubmit() {
    setSaving(true); setError(null)
    const result = await saveDiary(answers as DiaryInput)
    if (result?.error) { setError(result.error); setSaving(false) }
    else { setSaved(true); setTimeout(() => setSaved(false), 1600) }
  }

  const currentValue = answers[current.key]
  const canNext = current.type === 'slider' ? true : typeof currentValue === 'string' && currentValue.trim().length > 0

  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })

  return (
    <DeviceFrame>
      <div style={{ padding: 16, position: 'relative' }}>

        {/* notepad header */}
        <div style={{
          background: 'linear-gradient(90deg, #ffd6e8, #ffb6d0)',
          color: 'var(--p-700)', padding: '8px 12px',
          border: '1.5px solid var(--p-500)', borderRadius: '10px 10px 0 0',
          fontSize: 13, fontWeight: 700,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          textShadow: '1px 1px 0 #fff', marginBottom: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => step > 0 && setStep(s => s - 1)}
              style={{ background: 'none', border: 'none', color: 'var(--p-700)', fontSize: 16, cursor: step > 0 ? 'pointer' : 'default', opacity: step > 0 ? 1 : 0 }}>
              ←
            </button>
            <span>♡ 오늘의일기.txt</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="pixel" style={{ fontSize: 10 }}>PRIVATE · AI ONLY</span>
            <StickerBadge style={{ fontSize: 11, padding: '3px 10px' }}>{step + 1} / {STEPS.length}</StickerBadge>
          </div>
        </div>

        {/* pixel progress bar */}
        <div style={{ display: 'flex', gap: 3, padding: '6px 12px', background: '#fff5fa', border: '1.5px solid var(--p-500)', borderTop: 'none', borderRadius: '0 0 0 0', borderBottom: '1px solid var(--p-300)' }}>
          {Array.from({ length: segs }).map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 7, borderRadius: 999,
              background: i < filled ? 'linear-gradient(90deg, #ffb6d0, #ff9ec5)' : 'var(--p-200)',
              border: '1px solid var(--p-400)', transition: 'background .3s',
            }} />
          ))}
        </div>

        {/* 줄노트 본문 */}
        <div style={{
          border: '1.5px solid var(--p-500)', borderTop: 'none',
          background: 'repeating-linear-gradient(0deg, #fff 0 27px, #ffe2ee 27px 28px)',
          padding: '12px 14px 14px',
          boxShadow: '0 0 0 3px #fff, 0 0 0 4.5px var(--p-500)',
          borderRadius: '0 0 12px 12px',
        }}>
          {/* 날짜 + 배지 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="pixel" style={{ fontSize: 11, color: 'var(--p-600)' }}>DATE</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{today}</span>
            <span style={{ flex: 1 }} />
            <StickerBadge color="#c8dcff" textColor="#4d6fb0">나의 일기</StickerBadge>
          </div>

          {/* 기분 (첫 스텝) */}
          {step === 0 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, marginBottom: 6, color: 'var(--p-700)', fontWeight: 700 }}>오늘의 기분 ♡</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {MOODS.map((m, i) => (
                  <button key={i} onClick={() => setMood(i)} style={{
                    padding: '7px 8px',
                    fontFamily: 'var(--font-screen)', fontSize: 17,
                    background: mood === i ? 'linear-gradient(180deg, #ffc8de, #ff9ec5)' : '#fff',
                    color: mood === i ? '#fff' : 'var(--p-700)',
                    textShadow: mood === i ? '1px 1px 0 rgba(238,131,177,.5)' : '1px 1px 0 #fff',
                    border: '1.5px solid var(--p-500)', borderRadius: 10,
                    boxShadow: mood === i ? 'inset 0 2px 4px rgba(238,131,177,.35)' : '0 0 0 2px #fff, 0 0 0 3px var(--p-500)',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, minWidth: 48,
                  }}>
                    <span>{m.e}</span>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-round)' }}>{m.lab}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 질문 */}
          <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'pre-line', lineHeight: 1.6, marginBottom: 10 }}>
            {current.question}
          </p>

          {current.type === 'textarea' ? (
            <textarea
              key={current.key} autoFocus rows={6}
              placeholder={current.placeholder}
              value={(answers[current.key] as string) ?? ''}
              onChange={e => handleChange(e.target.value)}
              style={{
                width: '100%', background: 'transparent',
                border: 'none', outline: 'none',
                fontFamily: 'var(--font-round)', fontSize: 14, lineHeight: '28px',
                color: 'var(--ink)', resize: 'none', padding: 0,
              }}
            />
          ) : (
            <div style={{ paddingTop: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--p-600)', marginBottom: 8 }}>
                <span>1°</span><span>10°</span>
              </div>
              <input type="range" min={1} max={10} step={1}
                value={(answers.temperature as number) ?? 5}
                onChange={e => handleChange(Number(e.target.value))}
                style={{ width: '100%', accentColor: '#ff9ec5' }}
              />
              <div style={{ textAlign: 'center', marginTop: 10 }}>
                <span className="screen" style={{ fontSize: 42, color: 'var(--p-600)' }}>{answers.temperature}°</span>
                <p style={{ marginTop: 4, fontSize: 12, color: 'var(--ink-2)' }}>
                  {TEMP_LABELS[answers.temperature as number]}
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 10, borderTop: '1.5px dashed var(--p-500)' }}>
            <span style={{ fontSize: 11, color: 'var(--p-600)' }}>
              <PixelHeart size={10} /> {typeof currentValue === 'string' ? currentValue.length : 0}자 · AI에게만 공개
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              {error && <span style={{ fontSize: 12, color: '#ef4444' }}>{error}</span>}
              <PxButton size="sm" color="white" onClick={() => step > 0 && setStep(s => s - 1)}>취소</PxButton>
              <PxButton size="sm" color="pink" disabled={!canNext || saving}
                onClick={isLast ? handleSubmit : () => setStep(s => s + 1)}>
                {saving ? '저장 중…' : isLast ? '♡ 저장' : '다음 →'}
              </PxButton>
            </div>
          </div>
        </div>

        {/* 저장 완료 팝업 */}
        {saved && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none', zIndex: 10 }}>
            <div className="sticker" style={{ padding: '14px 22px', background: 'linear-gradient(180deg, #fff, #ffe2ee)', color: 'var(--p-700)', fontSize: 15, fontWeight: 700, animation: 'pop .3s', textShadow: '1px 1px 0 #fff' }}>
              ♡ saved! AI가 분석중…
            </div>
          </div>
        )}

        <div style={{ marginTop: 12, fontSize: 11, opacity: .65, textAlign: 'center', lineHeight: 1.7, color: 'var(--ink-2)' }}>
          ▸ 둘이 각자 작성한 내용은 절대 서로에게 공개되지 않아요.
        </div>
      </div>
    </DeviceFrame>
  )
}
