'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createCouple, joinCouple } from '@/app/actions/couple'
import { createClient } from '@/lib/supabase/client'

type Status =
  | { type: 'loading' }
  | { type: 'no_couple' }
  | { type: 'waiting'; code: string }
  | { type: 'connected'; partnerNickname: string; level: number; exp: number }

export default function CouplePage() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>({ type: 'loading' })
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [inputCode, setInputCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data: profile } = await supabase
      .from('profiles')
      .select('couple_id')
      .eq('id', user.id)
      .single()

    if (!profile?.couple_id) {
      setStatus({ type: 'no_couple' })
      return
    }

    // 파트너 있는지 확인
    const { data: members } = await supabase
      .from('profiles')
      .select('id, nickname')
      .eq('couple_id', profile.couple_id)

    const partner = members?.find(m => m.id !== user.id)

    if (!partner) {
      // 내가 만든 코드 조회
      const { data: couple } = await supabase
        .from('couples')
        .select('invite_code')
        .eq('id', profile.couple_id)
        .single()

      setStatus({ type: 'waiting', code: couple?.invite_code ?? '' })
    } else {
      const { data: couple } = await supabase
        .from('couples')
        .select('level, exp')
        .eq('id', profile.couple_id)
        .single()

      setStatus({
        type: 'connected',
        partnerNickname: partner.nickname ?? '파트너',
        level: couple?.level ?? 1,
        exp: couple?.exp ?? 0,
      })
    }
  }

  async function handleCreate() {
    setLoading(true)
    setError(null)
    const result = await createCouple()
    if (result.error) {
      setError(result.error)
    } else {
      setMode('choose')
      await loadStatus()
    }
    setLoading(false)
  }

  async function handleJoin() {
    if (inputCode.trim().length < 6) {
      setError('6자리 코드를 입력해주세요.')
      return
    }
    setLoading(true)
    setError(null)
    const result = await joinCouple(inputCode)
    if (result.error) {
      setError(result.error)
    } else {
      await loadStatus()
    }
    setLoading(false)
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (status.type === 'loading') {
    return (
      <div className="min-h-screen bg-rose-50 flex items-center justify-center">
        <div className="text-gray-300 text-sm">불러오는 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800">💑 커플 연결</h1>
        </div>

        {/* 연결 완료 */}
        {status.type === 'connected' && (
          <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4 text-center">
            <div className="text-4xl">🥰</div>
            <p className="font-semibold text-gray-800">{status.partnerNickname}님과 연결됐어요!</p>
            <div className="bg-rose-50 rounded-2xl p-4 space-y-2">
              <p className="text-sm text-gray-500">커플 레벨</p>
              <p className="text-3xl font-bold text-rose-500">Lv.{status.level}</p>
              <p className="text-xs text-gray-400">{status.exp} XP</p>
            </div>
            <button
              onClick={() => router.push('/home')}
              className="w-full rounded-2xl bg-rose-400 py-3 text-white font-semibold"
            >
              홈으로
            </button>
          </div>
        )}

        {/* 파트너 대기 중 */}
        {status.type === 'waiting' && (
          <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4 text-center">
            <div className="text-4xl animate-pulse">📨</div>
            <p className="text-gray-600 text-sm">이 코드를 파트너에게 보내주세요</p>
            <div
              className="bg-rose-50 rounded-2xl py-5 cursor-pointer active:bg-rose-100 transition-colors"
              onClick={() => copyCode(status.code)}
            >
              <p className="text-4xl font-bold tracking-widest text-rose-500">{status.code}</p>
              <p className="text-xs text-gray-400 mt-2">{copied ? '✓ 복사됐어요!' : '탭해서 복사'}</p>
            </div>
            <p className="text-xs text-gray-400">파트너가 코드를 입력하면 자동으로 연결돼요</p>
            <button
              onClick={loadStatus}
              className="w-full rounded-2xl border border-rose-200 py-3 text-rose-400 font-medium text-sm"
            >
              새로고침
            </button>
          </div>
        )}

        {/* 커플 없음 — 선택 화면 */}
        {status.type === 'no_couple' && mode === 'choose' && (
          <div className="bg-white rounded-3xl shadow-sm p-6 space-y-3">
            <p className="text-center text-gray-500 text-sm mb-4">어떻게 연결할까요?</p>
            <button
              onClick={() => { setMode('create'); setError(null) }}
              className="w-full rounded-2xl bg-rose-400 py-4 text-white font-semibold"
            >
              코드 만들기
            </button>
            <button
              onClick={() => { setMode('join'); setError(null) }}
              className="w-full rounded-2xl border border-rose-200 py-4 text-rose-400 font-semibold"
            >
              코드 입력하기
            </button>
          </div>
        )}

        {/* 코드 만들기 */}
        {status.type === 'no_couple' && mode === 'create' && (
          <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
            <p className="text-center text-gray-600 text-sm">
              코드를 생성하면 파트너에게 공유해주세요.
            </p>
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full rounded-2xl bg-rose-400 py-4 text-white font-semibold disabled:opacity-40"
            >
              {loading ? '생성 중...' : '코드 생성하기'}
            </button>
            <button onClick={() => setMode('choose')} className="w-full text-sm text-gray-400">
              ← 돌아가기
            </button>
          </div>
        )}

        {/* 코드 입력하기 */}
        {status.type === 'no_couple' && mode === 'join' && (
          <div className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
            <p className="text-center text-gray-600 text-sm">파트너에게 받은 6자리 코드를 입력해주세요.</p>
            <input
              type="text"
              maxLength={6}
              placeholder="XXXXXX"
              value={inputCode}
              onChange={e => setInputCode(e.target.value.toUpperCase())}
              className="w-full text-center text-2xl font-bold tracking-widest rounded-2xl border border-rose-100 bg-rose-50 px-4 py-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-300 uppercase"
            />
            {error && <p className="text-sm text-red-400 text-center">{error}</p>}
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full rounded-2xl bg-rose-400 py-4 text-white font-semibold disabled:opacity-40"
            >
              {loading ? '연결 중...' : '연결하기'}
            </button>
            <button onClick={() => setMode('choose')} className="w-full text-sm text-gray-400">
              ← 돌아가기
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
