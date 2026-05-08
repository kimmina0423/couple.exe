'use client'

import { useState } from 'react'
import { completeQuest } from '@/app/actions/quest'

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
    <div className="bg-white rounded-3xl shadow-sm p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">📋</span>
        <h3 className="font-semibold text-gray-700">오늘의 퀘스트</h3>
      </div>

      <p className="text-gray-800 font-medium">{questText}</p>
      <p className="text-xs text-gray-400">{questTheory}</p>

      {monsterDefeated && (
        <div className="rounded-2xl bg-gray-800 p-3 text-center text-sm font-semibold text-white">
          ⚔️ 몬스터를 물리쳤어요! 관계가 회복되고 있어요
        </div>
      )}
      {leveledUp && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3 text-center text-sm font-semibold text-amber-600">
          🎉 레벨업! 두 분의 관계가 한 단계 성장했어요
        </div>
      )}

      <button
        onClick={handleComplete}
        disabled={done || loading}
        className={`w-full rounded-2xl py-3 font-semibold text-sm transition-colors ${
          done
            ? 'bg-green-100 text-green-600'
            : 'bg-rose-400 text-white active:bg-rose-500'
        } disabled:opacity-60`}
      >
        {loading ? '처리 중...' : done ? '✓ 완료했어요 (+10 XP)' : '완료했어요'}
      </button>
    </div>
  )
}
