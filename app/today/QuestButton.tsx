'use client'

import { useState } from 'react'
import { completeQuest } from '@/app/actions/quest'
import { PxButton, PuffyHeart, PixelHeart } from '@/components/y2k'

type Props = {
  coupleId: string
  questText: string
  questTheory: string
  alreadyDone: boolean
}

export default function QuestButton({ coupleId, questText, questTheory, alreadyDone }: Props) {
  const [done, setDone] = useState(alreadyDone)
  const [loading, setLoading] = useState(false)
  const [leveledUp, setLeveledUp] = useState(false)
  const [monsterDefeated, setMonsterDefeated] = useState(false)

  async function handleComplete() {
    setLoading(true)
    const result = await completeQuest(coupleId)
    if (result.leveledUp) setLeveledUp(true)
    if (result.monsterDefeated) setMonsterDefeated(true)
    setDone(true)
    setLoading(false)
  }

  return (
    <div style={{
      border: '1.5px solid var(--p-500)', borderRadius: 16,
      boxShadow: '0 0 0 3px #fff, 0 0 0 4.5px var(--p-500), 0 8px 14px -6px rgba(238,131,177,.4)',
      background: '#fff', overflow: 'hidden',
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(90deg, #ffd6e8, #ffb6d0)',
        color: 'var(--p-700)', padding: '6px 14px',
        borderBottom: '1.5px dashed var(--p-500)',
        fontSize: 12, fontWeight: 700, textShadow: '1px 1px 0 #fff',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <PixelHeart size={12} /> 오늘의 퀘스트
        <span className="pixel" style={{ marginLeft: 'auto', fontSize: 10, opacity: .7 }}>DAILY QUEST</span>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 퀘스트 카드 */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 12,
            background: done ? 'linear-gradient(180deg, #d4f0e2, #a8dcbe)' : 'linear-gradient(180deg, #fff5fa, #ffd6e8)',
            border: `1.5px solid ${done ? '#7dcfa8' : 'var(--p-400)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            {done
              ? <span style={{ fontFamily: 'var(--font-screen)', fontSize: 22, color: '#3a7a5a' }}>✓</span>
              : <PuffyHeart size={34} />
            }
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.5, marginBottom: 4 }}>
              {questText}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>
              {questTheory}
            </div>
          </div>
        </div>

        {/* 몬스터 처치 알림 */}
        {monsterDefeated && (
          <div style={{
            background: 'linear-gradient(135deg, #3d1f3d, #6b4566)',
            border: '1.5px solid var(--p-500)', borderRadius: 12,
            boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px var(--p-500)',
            padding: '10px 14px', textAlign: 'center',
            color: '#fff', fontSize: 14, fontWeight: 700,
            textShadow: '1px 1px 0 rgba(0,0,0,.3)',
          }}>
            ★ 몬스터를 물리쳤어요! 관계가 회복되고 있어요
          </div>
        )}

        {/* 레벨업 알림 */}
        {leveledUp && (
          <div style={{
            background: 'linear-gradient(135deg, var(--lavender), #c8dcff)',
            border: '1.5px solid var(--blue-2)', borderRadius: 12,
            boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px var(--blue-2)',
            padding: '10px 14px', textAlign: 'center',
            color: '#4d6fb0', fontSize: 14, fontWeight: 700,
            textShadow: '1px 1px 0 #fff',
          }}>
            ✦ 레벨업! 두 분의 관계가 한 단계 성장했어요
          </div>
        )}

        {/* 버튼 */}
        <PxButton
          color={done ? 'soft' : 'pink'}
          disabled={done || loading}
          onClick={handleComplete}
          style={{ width: '100%', textAlign: 'center' }}
        >
          {loading ? '처리 중…' : done ? '✓ 완료했어요 (+10 XP)' : '♡ 완료했어요'}
        </PxButton>
      </div>
    </div>
  )
}
