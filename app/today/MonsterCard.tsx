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
  const hpBarColor = hpPercent > 60 ? '#ee83b1' : hpPercent > 30 ? '#c8dcff' : '#d4f0e2'
  const segs = 14
  const filled = Math.round((hpPercent / 100) * segs)

  return (
    <div style={{
      background: 'linear-gradient(155deg, #3d1f3d 0%, #5a2a5a 50%, #6b4566 100%)',
      border: '2px solid var(--p-500)',
      borderRadius: 16,
      boxShadow: '0 0 0 3px #fff, 0 0 0 4.5px var(--p-500), 0 12px 24px -8px rgba(107,69,102,.5)',
      overflow: 'hidden',
    }}>
      {/* 타이틀 바 (Win98 느낌, 다크) */}
      <div style={{
        background: 'linear-gradient(90deg, #5a2a5a, #3d1f3d)',
        padding: '7px 14px',
        borderBottom: '1.5px solid var(--p-500)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span className="pixel" style={{ fontSize: 11, color: 'var(--p-400)', letterSpacing: 2 }}>
          MONSTER ALERT
        </span>
        <span style={{
          background: 'linear-gradient(180deg, var(--p-400), var(--p-500))',
          color: '#fff', fontSize: 11, fontWeight: 700,
          padding: '2px 8px', borderRadius: 999, fontFamily: 'var(--font-pixel)',
          textShadow: '1px 1px 0 rgba(238,131,177,.5)',
        }}>
          {hp} HP
        </span>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* 몬스터 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'linear-gradient(135deg, #ffd6e8, #ffb6d0)',
            border: '1.5px solid var(--p-500)',
            boxShadow: '0 0 0 2px #fff, 0 0 0 3.5px var(--p-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, flexShrink: 0,
          }}>
            {config.emoji}
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', textShadow: '1px 1px 0 rgba(0,0,0,.4)', lineHeight: 1.2 }}>
              {config.name} <span style={{ color: 'var(--p-400)' }}>출현!</span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--p-300)', marginTop: 3, lineHeight: 1.5 }}>
              {config.description}
            </div>
          </div>
        </div>

        {/* HP 바 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
            <span className="pixel" style={{ color: 'var(--p-400)' }}>HP</span>
            <span className="screen" style={{ color: '#fff', fontSize: 14 }}>{hp} / {maxHp}</span>
          </div>
          <div style={{
            display: 'flex', gap: 2, padding: 3, borderRadius: 999,
            border: '1.5px solid var(--p-500)',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,.3), 0 0 0 2px rgba(255,255,255,.1)',
            background: 'rgba(0,0,0,.3)',
          }}>
            {Array.from({ length: segs }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 10,
                background: i < filled ? hpBarColor : 'rgba(255,255,255,.08)',
                boxShadow: i < filled ? `inset 0 1px 0 rgba(255,255,255,.4), 0 0 4px ${hpBarColor}55` : 'none',
                borderRadius: i === 0 ? '999px 2px 2px 999px' : i === segs - 1 ? '2px 999px 999px 2px' : 2,
              }} />
            ))}
          </div>
        </div>

        {/* 약점 */}
        <div style={{
          background: 'rgba(255,255,255,.07)',
          border: '1px solid rgba(255,158,197,.3)',
          borderRadius: 12, padding: '10px 12px',
        }}>
          <div className="pixel" style={{ fontSize: 10, color: 'var(--p-400)', marginBottom: 5, letterSpacing: 1 }}>
            ★ 약점
          </div>
          <div style={{ fontSize: 13, color: 'var(--p-200)', lineHeight: 1.6 }}>
            {config.weakness}
          </div>
        </div>

        {/* 공격 스킬 */}
        <div>
          <div className="pixel" style={{ fontSize: 10, color: 'var(--p-400)', marginBottom: 8, letterSpacing: 1 }}>
            ♡ 공격 스킬 (추천 멘트)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {config.skills.map((skill: string, i: number) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,.07)',
                border: '1px solid rgba(255,158,197,.2)',
                borderRadius: 10, padding: '8px 12px',
                fontSize: 13, color: 'var(--p-100)', lineHeight: 1.5,
              }}>
                {skill}
              </div>
            ))}
          </div>
        </div>

        <div className="pixel" style={{ fontSize: 10, color: 'var(--p-500)', textAlign: 'center', opacity: .7 }}>
          ▸ 퀘스트 완료 시 체력 -20
        </div>
      </div>
    </div>
  )
}
