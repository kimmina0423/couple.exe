'use client'

import { MONSTER_CONFIG, type MonsterType } from '@/lib/monster'

type Props = {
  type: MonsterType
  hp: number
  maxHp: number
}

export default function MonsterCard({ type, hp, maxHp }: Props) {
  const config = MONSTER_CONFIG[type]
  const hpPercent = Math.round((hp / maxHp) * 100)
  const hpColor = hpPercent > 60 ? 'bg-red-400' : hpPercent > 30 ? 'bg-amber-400' : 'bg-green-400'

  return (
    <div className="bg-gray-900 rounded-3xl p-5 space-y-4 text-white">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{config.emoji}</span>
          <div>
            <p className="font-bold text-lg">{config.name} 출현!</p>
            <p className="text-xs text-gray-400">{config.description}</p>
          </div>
        </div>
        <span className="text-sm font-bold text-rose-400">{hp} HP</span>
      </div>

      {/* HP 바 */}
      <div className="space-y-1">
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className={`${hpColor} h-3 rounded-full transition-all duration-500`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 text-right">{hp} / {maxHp}</p>
      </div>

      {/* 약점 */}
      <div className="bg-gray-800 rounded-2xl p-3">
        <p className="text-xs text-amber-400 font-semibold mb-1">⚡ 약점</p>
        <p className="text-sm text-gray-300">{config.weakness}</p>
      </div>

      {/* 공격 스킬 */}
      <div className="space-y-2">
        <p className="text-xs text-rose-400 font-semibold">💬 공격 스킬 (추천 멘트)</p>
        {config.skills.map((skill, i) => (
          <div key={i} className="bg-gray-800 rounded-xl px-3 py-2">
            <p className="text-sm text-gray-200">{skill}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 text-center">퀘스트 완료 시 체력 -20</p>
    </div>
  )
}
