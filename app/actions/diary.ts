'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type DiaryInput = {
  q1_moment: string
  q2_gratitude: string
  q3_conflict: string
  q4_mood: string
  q5_wish: string
  temperature: number
}

export async function saveDiary(data: DiaryInput) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (!profile?.couple_id) {
    return { error: '커플 연결이 필요합니다. 먼저 파트너와 연결해주세요.' }
  }

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('diary_entries')
    .upsert({
      user_id: user.id,
      couple_id: profile.couple_id,
      date: today,
      ...data,
    }, { onConflict: 'user_id,date' })

  if (error) return { error: error.message }

  redirect('/home')
}
