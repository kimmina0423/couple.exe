'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="ko">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#fff5fa' }}>
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', border: '2px solid #ff9ec5', borderRadius: 16,
            padding: '32px 40px', textAlign: 'center', maxWidth: 340,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠</div>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>앗, 뭔가 잘못됐어요</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
              {error.message || '알 수 없는 오류가 발생했어요.'}
            </div>
            <button onClick={reset} style={{
              background: '#ff9ec5', color: '#fff', border: 'none',
              borderRadius: 999, padding: '10px 28px', fontSize: 14,
              fontWeight: 700, cursor: 'pointer',
            }}>
              다시 시도 ↺
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
