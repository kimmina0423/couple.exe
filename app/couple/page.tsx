'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createCouple, joinCouple } from '@/app/actions/couple'
import { createClient } from '@/lib/supabase/client'
import DeviceFrame from '@/components/DeviceFrame'

type Status =
  | { type: 'loading' }
  | { type: 'no_couple' }
  | { type: 'waiting'; code: string }
  | { type: 'connected'; partnerNickname: string; level: number; exp: number }

const pinkBtn = {
  width: '100%', background: 'linear-gradient(180deg, #ffc8de, #ff9ec5)',
  color: '#fff', border: '2px solid #ee83b1', borderRadius: 999,
  boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px #ee83b1',
  padding: '12px', fontSize: 15, fontFamily: 'var(--font-round)' as const, fontWeight: 700,
  cursor: 'pointer', textShadow: '1px 1px 0 rgba(238,131,177,.5)',
} as React.CSSProperties

const whiteBtn = {
  width: '100%', background: 'linear-gradient(180deg, #fff, #fff0f6)',
  color: 'var(--p-700)', border: '2px solid var(--p-500)', borderRadius: 999,
  boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px var(--p-500)',
  padding: '12px', fontSize: 15, fontFamily: 'var(--font-round)' as const, fontWeight: 700,
  cursor: 'pointer', textShadow: '1px 1px 0 #fff',
} as React.CSSProperties

const inputStyle = {
  width: '100%',
  background: 'repeating-linear-gradient(0deg, #fff 0 27px, #ffe2ee 27px 28px)',
  border: '1.5px solid var(--p-500)', borderRadius: 8,
  padding: '12px', fontFamily: 'var(--font-round)' as const,
  fontSize: 20, color: 'var(--ink)', outline: 'none',
  boxShadow: '0 0 0 2px #fff, 0 0 0 3px var(--p-400)',
  textAlign: 'center' as const, letterSpacing: 6, fontWeight: 700,
}

export default function CouplePage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>({ type: 'loading' })
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => { loadStatus() }, [])

  async function loadStatus() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles').select('couple_id').eq('id', user.id).single()

    if (!profile?.couple_id) { setStatus({ type: 'no_couple' }); return }

    const { data: members } = await supabase
      .from('profiles').select('id, nickname').eq('couple_id', profile.couple_id)

    const partner = members?.find(m => m.id !== user.id)

    if (!partner) {
      const { data: couple } = await supabase
        .from('couples').select('invite_code').eq('id', profile.couple_id).single()
      setStatus({ type: 'waiting', code: couple?.invite_code ?? '' })
    } else {
      const { data: couple } = await supabase
        .from('couples').select('level, exp').eq('id', profile.couple_id).single()
      setStatus({ type: 'connected', partnerNickname: partner.nickname ?? '파트너', level: couple?.level ?? 1, exp: couple?.exp ?? 0 })
    }
  }

  async function handleCreate() {
    setLoading(true); setError(null)
    const result = await createCouple()
    if (result.error) { setError(result.error) } else { setMode('choose'); await loadStatus() }
    setLoading(false)
  }

  async function handleJoin() {
    if (inputCode.trim().length < 6) { setError('6자리 코드를 입력해주세요.'); return }
    setLoading(true); setError(null)
    const result = await joinCouple(inputCode)
    if (result.error) { setError(result.error) } else { await loadStatus() }
    setLoading(false)
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ErrorBox = ({ msg }: { msg: string }) => (
    <div style={{ background: 'linear-gradient(180deg, #fff, var(--p-200))', border: '1.5px solid var(--p-500)', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: 'var(--p-700)', textAlign: 'center' }}>
      ⚠ {msg}
    </div>
  )

  const BackBtn = () => (
    <button style={{ background: 'none', border: 'none', color: 'var(--p-600)', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-round)', fontWeight: 700 }}
      onClick={() => setMode('choose')}>
      ← 돌아가기
    </button>
  )

  return (
    <DeviceFrame>
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

        {/* 로딩 */}
        {status.type === 'loading' && (
          <div style={{ paddingTop: 60, textAlign: 'center' }}>
            <div className="cursive" style={{ fontSize: 20, color: 'var(--p-500)', textShadow: '1px 1px 0 #fff', animation: 'wiggle 1.6s infinite' }}>
              loading ♡
            </div>
          </div>
        )}

        {/* 연결 완료 */}
        {status.type === 'connected' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div style={{ animation: 'heartbeat 1.6s infinite' }}>
              <svg viewBox="0 0 36 32" width={56}>
                <path d="M18 30 C 4 22, 0 14, 0 9 C 0 3, 4 0, 9 0 C 13 0, 16 2, 18 5 C 20 2, 23 0, 27 0 C 32 0, 36 3, 36 9 C 36 14, 32 22, 18 30 Z"
                  fill="#ffb6d0" stroke="#ff9ec5" strokeWidth="1.2" />
                <ellipse cx="9" cy="7" rx="3" ry="2" fill="#fff" opacity=".85" />
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', textAlign: 'center' }}>
              {status.partnerNickname}님과 연결됐어요!
            </div>
            <div style={{
              width: '100%', background: 'linear-gradient(135deg, var(--p-100), var(--lavender))',
              border: '1.5px solid var(--p-400)', borderRadius: 14,
              boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px var(--p-400)',
              padding: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4,
            }}>
              <div style={{ fontSize: 12, color: 'var(--p-700)', fontWeight: 700 }}>커플 레벨</div>
              <div className="screen" style={{ fontSize: 36, color: 'var(--p-600)', lineHeight: 1 }}>Lv.{status.level}</div>
              <div className="pixel" style={{ fontSize: 12, color: 'var(--p-700)' }}>{status.exp} XP</div>
            </div>
            <button style={{ ...pinkBtn, width: '100%' }} onClick={() => router.push('/home')}>홈으로 →</button>
          </div>
        )}

        {/* 파트너 대기 중 */}
        {status.type === 'waiting' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
            <div className="cursive" style={{ fontSize: 16, color: 'var(--p-600)', textShadow: '1px 1px 0 #fff', textAlign: 'center' }}>
              이 코드를 파트너에게 보내주세요
            </div>
            <div
              style={{
                width: '100%', background: 'linear-gradient(135deg, #fff5fa, var(--p-200))',
                border: '2px solid var(--p-500)', borderRadius: 16,
                boxShadow: '0 0 0 3px #fff, 0 0 0 4.5px var(--p-500)',
                padding: 20, cursor: 'pointer', textAlign: 'center',
              }}
              onClick={() => copyCode(status.code)}
            >
              <div className="screen" style={{ fontSize: 40, color: 'var(--p-600)', letterSpacing: 6 }}>{status.code}</div>
              <div className="pixel" style={{ fontSize: 11, color: 'var(--p-700)', marginTop: 8, opacity: .7 }}>
                {copied ? '✓ 복사됐어요!' : '▸ 탭해서 복사'}
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6, textAlign: 'center' }}>
              파트너가 코드를 입력하면 자동으로 연결돼요
            </div>
            <button style={whiteBtn} onClick={loadStatus}>새로고침 ↺</button>
          </div>
        )}

        {/* 선택 화면 */}
        {status.type === 'no_couple' && mode === 'choose' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--ink-2)', marginBottom: 4 }}>
              어떻게 연결할까요?
            </div>
            <button style={pinkBtn} onClick={() => { setMode('create'); setError(null) }}>♡ 코드 만들기</button>
            <button style={whiteBtn} onClick={() => { setMode('join'); setError(null) }}>코드 입력하기 →</button>
          </div>
        )}

        {/* 코드 만들기 */}
        {status.type === 'no_couple' && mode === 'create' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              코드를 생성한 뒤 파트너에게 공유해주세요.
            </div>
            {error && <ErrorBox msg={error} />}
            <button style={{ ...pinkBtn, opacity: loading ? .55 : 1 }} disabled={loading} onClick={handleCreate}>
              {loading ? '생성 중…' : '♡ 코드 생성하기'}
            </button>
            <BackBtn />
          </div>
        )}

        {/* 코드 입력하기 */}
        {status.type === 'no_couple' && mode === 'join' && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              파트너에게 받은 6자리 코드를 입력해주세요.
            </div>
            <input type="text" maxLength={6} placeholder="XXXXXX"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              style={inputStyle}
            />
            {error && <ErrorBox msg={error} />}
            <button style={{ ...pinkBtn, opacity: loading ? .55 : 1 }} disabled={loading} onClick={handleJoin}>
              {loading ? '연결 중…' : '♡ 연결하기'}
            </button>
            <BackBtn />
          </div>
        )}
      </div>
    </DeviceFrame>
  )
}
