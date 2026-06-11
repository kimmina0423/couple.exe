'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff5fa, #ffd6e8)',
      fontFamily: 'var(--font-round)',
    }}>
      <div style={{
        background: '#fff', border: '2px solid #ff9ec5', borderRadius: 16,
        boxShadow: '0 0 0 3px #fff, 0 0 0 4.5px #ff9ec5',
        padding: '32px 40px', textAlign: 'center', maxWidth: 340,
      }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
        <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
          앗, 뭔가 잘못됐어요
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 20 }}>
          {error.message || '알 수 없는 오류가 발생했어요.'}
        </div>
        <button
          onClick={reset}
          style={{
            background: 'linear-gradient(180deg, #ffc8de, #ff9ec5)',
            color: '#fff', border: '2px solid #ee83b1', borderRadius: 999,
            boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px #ee83b1',
            padding: '10px 28px', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'var(--font-round)',
          }}
        >
          다시 시도 ↺
        </button>
      </div>
    </div>
  )
}
