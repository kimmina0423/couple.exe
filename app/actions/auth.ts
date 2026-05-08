'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nickname = formData.get('nickname') as string

  const supabase = createClient()

  const { error } = await supabase.auth.signUp({ email, password })
  if (error) return { error: error.message }

  // nickname은 트리거로 생성된 profile에 업데이트
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await supabase
      .from('profiles')
      .update({ nickname })
      .eq('id', user.id)
  }

  redirect('/home')
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: '이메일 또는 비밀번호가 올바르지 않아요.' }

  redirect('/home')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
