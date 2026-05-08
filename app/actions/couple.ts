'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function createCouple() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (profile?.couple_id) return { error: '이미 파트너와 연결되어 있어요.' }

  // UUID를 미리 생성 → INSERT 후 SELECT 없이 바로 사용 (RLS 우회 불필요)
  const { randomUUID } = await import('crypto')
  let code = ''
  let coupleId = ''

  for (let i = 0; i < 3; i++) {
    coupleId = randomUUID()
    code = generateCode()
    const { error } = await supabase
      .from('couples')
      .insert({ id: coupleId, invite_code: code })

    if (!error) break
    coupleId = ''
  }

  if (!coupleId) return { error: '코드 생성에 실패했어요. 다시 시도해주세요.' }

  await supabase
    .from('profiles')
    .update({ couple_id: coupleId })
    .eq('id', user.id)

  revalidatePath('/couple')
  return { success: true, code }
}

export async function joinCouple(code: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('couple_id')
    .eq('id', user.id)
    .single()

  if (profile?.couple_id) return { error: '이미 파트너와 연결되어 있어요.' }

  // RPC로 초대코드 → couple id 조회 (RLS 우회)
  const { data: coupleId, error: rpcError } = await supabase
    .rpc('find_couple_by_code', { code })

  if (rpcError || !coupleId) return { error: '코드를 찾을 수 없어요. 다시 확인해주세요.' }

  // 이미 두 명이면 막기
  const { count } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('couple_id', coupleId)

  if ((count ?? 0) >= 2) return { error: '이미 연결된 커플 코드예요.' }

  await supabase
    .from('profiles')
    .update({ couple_id: coupleId })
    .eq('id', user.id)

  revalidatePath('/couple')
  return { success: true }
}
