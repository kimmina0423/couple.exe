'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from '@/app/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await signIn(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>

      {/* 로고 */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div className="cursive" style={{ fontSize: 42, color: 'var(--p-600)', textShadow: '2px 2px 0 #fff, 3px 3px 0 var(--p-500)', lineHeight: 1 }}>
          couple ♡
        </div>
        <div className="pixel" style={{ fontSize: 10, color: 'var(--p-700)', marginTop: 6, letterSpacing: 2, opacity: .65 }}>
          ✿ HEART OS · LOGIN ✿
        </div>
      </div>

      {/* Win98 창 */}
      <div className="win" style={{ width: '100%', maxWidth: 360 }}>
        <div className="win-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 16, height: 16, background: 'linear-gradient(180deg,#fff,#ffd6e8)',
              border: '1.2px solid var(--p-500)', borderRadius: 4,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, color: 'var(--p-700)',
            }}>♡</span>
            로그인.exe
          </span>
          <div className="win-buttons">
            <button className="win-btn">_</button>
            <button className="win-btn">▢</button>
            <button className="win-btn" style={{ background: 'linear-gradient(180deg,#ffc8de,#ff9ec5)', color: '#fff' }}>×</button>
          </div>
        </div>
        <div className="win-menu">
          <span><u>F</u>ile</span>
          <span><u>E</u>dit</span>
          <span><u>H</u>elp</span>
        </div>
        <div className="win-body" style={{ padding: 0 }}>
          <form onSubmit={handleSubmit} style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--p-700)', display: 'block', marginBottom: 5, textShadow: '1px 1px 0 #fff' }}>
                이메일
              </label>
              <input
                name="email" type="email" required autoComplete="email"
                placeholder="hello@example.com"
                style={{
                  width: '100%',
                  background: 'repeating-linear-gradient(0deg, #fff 0 27px, #ffe2ee 27px 28px)',
                  border: '1.5px solid var(--p-500)', borderRadius: 8,
                  padding: '10px 12px',
                  fontFamily: 'var(--font-round)', fontSize: 14, color: 'var(--ink)',
                  outline: 'none', boxShadow: '0 0 0 2px #fff, 0 0 0 3px var(--p-400)',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--p-700)', display: 'block', marginBottom: 5, textShadow: '1px 1px 0 #fff' }}>
                비밀번호
              </label>
              <input
                name="password" type="password" required autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%',
                  background: 'repeating-linear-gradient(0deg, #fff 0 27px, #ffe2ee 27px 28px)',
                  border: '1.5px solid var(--p-500)', borderRadius: 8,
                  padding: '10px 12px',
                  fontFamily: 'var(--font-round)', fontSize: 14, color: 'var(--ink)',
                  outline: 'none', boxShadow: '0 0 0 2px #fff, 0 0 0 3px var(--p-400)',
                }}
              />
            </div>

            {error && (
              <div style={{
                background: 'linear-gradient(180deg, #fff, var(--p-200))',
                border: '1.5px solid var(--p-500)', borderRadius: 10,
                padding: '8px 12px', fontSize: 13, color: 'var(--p-700)',
                textShadow: '1px 1px 0 #fff', textAlign: 'center',
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                background: 'linear-gradient(180deg, #ffc8de, #ff9ec5)',
                color: '#fff', border: '2px solid #ee83b1', borderRadius: 999,
                boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px #ee83b1, 0 4px 0 -1px rgba(238,131,177,.3)',
                padding: '12px', fontSize: 15, fontFamily: 'var(--font-round)', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? .55 : 1,
                textShadow: '1px 1px 0 rgba(238,131,177,.5)', marginBottom: 6,
              }}
            >
              {loading ? '♡ 로그인 중…' : '♡ 로그인'}
            </button>
          </form>

          {/* 상태바 */}
          <div style={{
            background: 'linear-gradient(90deg, #fff5fa, #ffe2ee)',
            borderTop: '1.2px solid var(--p-300)',
            padding: '6px 14px', fontSize: 12, color: 'var(--p-700)', fontWeight: 700,
          }}>
            처음이에요?{' '}
            <Link href="/signup" style={{ color: 'var(--p-600)', textDecoration: 'underline dotted' }}>
              회원가입 →
            </Link>
          </div>
        </div>
      </div>

      <div className="pixel" style={{ marginTop: 16, fontSize: 10, color: 'var(--p-500)', opacity: .55, textAlign: 'center', letterSpacing: 1 }}>
        v0.2 · PRIVATE BETA · MADE 4 U
      </div>
    </div>
  )
}
