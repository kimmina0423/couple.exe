'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'

export default function SignupPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않아요.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }

    setLoading(true)
    const result = await signUp(formData)
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
          <p className="mt-2 text-gray-400 text-sm">함께 시작해요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">닉네임</label>
            <input
              name="nickname"
              type="text"
              required
              className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="파트너가 볼 이름"
            />
          </div>

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
              autoComplete="new-password"
              className="w-full rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="6자 이상"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-600">비밀번호 확인</label>
            <input
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
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
            {loading ? '가입 중...' : '시작하기'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400">
          이미 계정이 있어요?{' '}
          <Link href="/login" className="text-rose-400 font-medium">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
