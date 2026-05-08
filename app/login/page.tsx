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
    <div className="min-h-screen bg-rose-50 flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">우리 사이 💑</h1>
          <p className="mt-2 text-gray-400 text-sm">오늘도 함께 기록해요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">이메일</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="hello@example.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">비밀번호</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-rose-400 py-4 text-white font-semibold disabled:opacity-40 active:bg-rose-500 transition-colors"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          처음이에요?{' '}
          <Link href="/signup" className="text-rose-400 font-medium">
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
