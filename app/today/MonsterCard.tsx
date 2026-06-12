'use client'

import { useState } from 'react'
import { MONSTER_CONFIG, type MonsterType } from '@/lib/monster'
import { pokePartner } from '@/app/actions/monster'

// ─── 픽셀아트 몬스터 SVG ──────────────────────────────────────────────────────

function SilenceMonster() {
  return (
    <svg viewBox="0 0 64 72" width={72} height={72} style={{ imageRendering: 'pixelated' }}>
      {/* 몸통 */}
      <ellipse cx="32" cy="34" rx="22" ry="24" fill="#9b59b6" />
      <ellipse cx="32" cy="34" rx="20" ry="22" fill="#b07fcc" />
      {/* 눈 (X) */}
      <line x1="22" y1="28" x2="28" y2="34" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      <line x1="28" y1="28" x2="22" y2="34" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      <line x1="36" y1="28" x2="42" y2="34" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      <line x1="42" y1="28" x2="36" y2="34" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
      {/* 지퍼 입 */}
      <rect x="20" y="40" width="24" height="4" rx="2" fill="#fff" opacity=".9"/>
      {[20,24,28,32,36,40].map(x => (
        <rect key={x} x={x} y={42} width="3" height="6" rx="1" fill="#9b59b6"/>
      ))}
      {/* 꼬리 */}
      <ellipse cx="14" cy="58" rx="7" ry="5" fill="#9b59b6" opacity=".7"/>
      <ellipse cx="26" cy="64" rx="5" ry="4" fill="#9b59b6" opacity=".6"/>
      <ellipse cx="38" cy="64" rx="5" ry="4" fill="#9b59b6" opacity=".6"/>
      <ellipse cx="50" cy="58" rx="7" ry="5" fill="#9b59b6" opacity=".7"/>
      {/* 광택 */}
      <ellipse cx="26" cy="26" rx="5" ry="3" fill="#fff" opacity=".25"/>
    </svg>
  )
}

function CriticismMonster() {
  return (
    <svg viewBox="0 0 72 72" width={72} height={72} style={{ imageRendering: 'pixelated' }}>
      {/* 뿔 */}
      <polygon points="20,18 26,4 30,18" fill="#c0392b"/>
      <polygon points="42,18 46,4 52,18" fill="#c0392b"/>
      {/* 머리 */}
      <rect x="14" y="16" width="44" height="36" rx="10" fill="#e74c3c"/>
      <rect x="16" y="18" width="40" height="32" rx="8" fill="#ff6b6b"/>
      {/* 눈 (찡그린) */}
      <ellipse cx="26" cy="30" rx="6" ry="5" fill="#fff"/>
      <ellipse cx="46" cy="30" rx="6" ry="5" fill="#fff"/>
      <ellipse cx="26" cy="31" rx="4" ry="4" fill="#c0392b"/>
      <ellipse cx="46" cy="31" rx="4" ry="4" fill="#c0392b"/>
      {/* 눈썹 (화난) */}
      <line x1="20" y1="22" x2="32" y2="26" stroke="#c0392b" strokeWidth="3" strokeLinecap="round"/>
      <line x1="40" y1="26" x2="52" y2="22" stroke="#c0392b" strokeWidth="3" strokeLinecap="round"/>
      {/* 입/이빨 */}
      <path d="M22 42 Q36 52 50 42" fill="#c0392b" stroke="none"/>
      {[24,30,36,42].map(x => (
        <polygon key={x} points={`${x},42 ${x+3},42 ${x+1.5},48`} fill="#fff"/>
      ))}
      {/* 불꽃 */}
      <ellipse cx="36" cy="13" rx="5" ry="7" fill="#f39c12" opacity=".8"/>
      <ellipse cx="36" cy="11" rx="3" ry="5" fill="#fff" opacity=".5"/>
      {/* 광택 */}
      <ellipse cx="28" cy="24" rx="4" ry="2.5" fill="#fff" opacity=".25"/>
    </svg>
  )
}

function AnxietyMonster() {
  return (
    <svg viewBox="0 0 64 72" width={72} height={72} style={{ imageRendering: 'pixelated' }}>
      {/* 떨림 효과 줄 */}
      {[0,1,2].map(i => (
        <line key={i} x1={8 + i*3} y1={20 + i*4} x2={12 + i*3} y2={16 + i*4}
          stroke="#f39c12" strokeWidth="1.5" opacity=".4" strokeLinecap="round"/>
      ))}
      {[0,1,2].map(i => (
        <line key={i} x1={56 - i*3} y1={20 + i*4} x2={52 - i*3} y2={16 + i*4}
          stroke="#f39c12" strokeWidth="1.5" opacity=".4" strokeLinecap="round"/>
      ))}
      {/* 몸통 (물결) */}
      <path d="M10 36 Q12 20 32 18 Q52 20 54 36 Q54 52 50 58 Q40 68 32 68 Q24 68 14 58 Q10 52 10 36 Z"
        fill="#f39c12"/>
      <path d="M13 36 Q15 22 32 21 Q49 22 51 36 Q51 50 48 56 Q40 65 32 65 Q24 65 16 56 Q13 50 13 36 Z"
        fill="#f5c842"/>
      {/* 커다란 눈 (불안) */}
      <ellipse cx="24" cy="36" rx="8" ry="9" fill="#fff"/>
      <ellipse cx="40" cy="36" rx="8" ry="9" fill="#fff"/>
      <ellipse cx="24" cy="38" rx="5" ry="6" fill="#e67e22"/>
      <ellipse cx="40" cy="38" rx="5" ry="6" fill="#e67e22"/>
      <ellipse cx="24" cy="38" rx="3" ry="4" fill="#1a0a00"/>
      <ellipse cx="40" cy="38" rx="3" ry="4" fill="#1a0a00"/>
      {/* 눈 반짝임 */}
      <ellipse cx="22" cy="35" rx="2" ry="1.5" fill="#fff" opacity=".8"/>
      <ellipse cx="38" cy="35" rx="2" ry="1.5" fill="#fff" opacity=".8"/>
      {/* 떨리는 입 */}
      <path d="M22 50 Q32 46 42 50" stroke="#e67e22" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* 광택 */}
      <ellipse cx="26" cy="28" rx="5" ry="3" fill="#fff" opacity=".2"/>
    </svg>
  )
}

function EmptinessMonster() {
  return (
    <svg viewBox="0 0 64 72" width={72} height={72} style={{ imageRendering: 'pixelated' }}>
      {/* 껍데기 외곽선 */}
      <ellipse cx="32" cy="36" rx="24" ry="28" fill="#4a5568" opacity=".5"/>
      <ellipse cx="32" cy="36" rx="22" ry="26" fill="#2d3748"/>
      <ellipse cx="32" cy="36" rx="19" ry="23" fill="#1a202c"/>
      {/* 텅 빈 눈 */}
      <ellipse cx="23" cy="32" rx="7" ry="8" fill="#2d3748" stroke="#718096" strokeWidth="1.5"/>
      <ellipse cx="41" cy="32" rx="7" ry="8" fill="#2d3748" stroke="#718096" strokeWidth="1.5"/>
      {/* 텅 빔 표현 — 속이 비어보이는 눈 */}
      <ellipse cx="23" cy="32" rx="4" ry="5" fill="#4a5568" opacity=".6"/>
      <ellipse cx="41" cy="32" rx="4" ry="5" fill="#4a5568" opacity=".6"/>
      {/* 무표정 입 */}
      <line x1="22" y1="46" x2="42" y2="46" stroke="#718096" strokeWidth="2.5" strokeLinecap="round" opacity=".7"/>
      {/* 금 (균열) */}
      <path d="M32 10 L30 20 L34 28" stroke="#718096" strokeWidth="1" fill="none" opacity=".5" strokeLinecap="round"/>
      <path d="M44 18 L40 26" stroke="#718096" strokeWidth="1" fill="none" opacity=".4" strokeLinecap="round"/>
      {/* 희미한 별 */}
      <circle cx="16" cy="22" r="1.5" fill="#a0aec0" opacity=".4"/>
      <circle cx="48" cy="20" r="1" fill="#a0aec0" opacity=".3"/>
      <circle cx="12" cy="44" r="1" fill="#a0aec0" opacity=".3"/>
    </svg>
  )
}

const MONSTER_ARTS: Record<MonsterType, React.FC> = {
  SILENCE:   SilenceMonster,
  CRITICISM: CriticismMonster,
  ANXIETY:   AnxietyMonster,
  EMPTINESS: EmptinessMonster,
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

type Props = {
  type: MonsterType
  hp: number
  maxHp: number
  coupleId: string
  pokeReceived?: boolean  // 파트너가 나를 찔렀는지 여부
}

export default function MonsterCard({ type, hp, maxHp, coupleId, pokeReceived = false }: Props) {
  const config = MONSTER_CONFIG[type]
  const MonsterArt = MONSTER_ARTS[type]

  const hpPercent = Math.round((hp / maxHp) * 100)
  const segs = 16
  const filled = Math.round((hpPercent / 100) * segs)
  const hpColor = hpPercent > 60 ? '#e74c3c' : hpPercent > 30 ? '#f39c12' : '#27ae60'

  const [poking, setPoking]     = useState(false)
  const [pokeDone, setPokeDone] = useState(false)
  const [pokeAnim, setPokeAnim] = useState(false)
  const [defeated, setDefeated] = useState(false)

  async function handlePoke() {
    if (poking || pokeDone) return
    setPoking(true)
    setPokeAnim(true)
    setTimeout(() => setPokeAnim(false), 600)

    const result = await pokePartner(coupleId)
    if (result.monsterDefeated) setDefeated(true)
    setPoking(false)
    setPokeDone(true)
  }

  if (defeated) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #d4f0e2, #a8dcbe)',
        border: '2px solid #7dcfa8', borderRadius: 16,
        boxShadow: '0 0 0 3px #fff, 0 0 0 4.5px #7dcfa8',
        padding: 20, textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 8, animation: 'pop .4s' }}>✨</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#2e6b4f' }}>
          {config.name}을(를) 물리쳤어요!
        </div>
        <div style={{ fontSize: 12, color: '#3a7a5a', marginTop: 4, lineHeight: 1.6 }}>
          두 분의 관계가 조금 더 단단해졌어요 ♡
        </div>
      </div>
    )
  }

  return (
    <div style={{
      background: `linear-gradient(155deg, ${config.bgFrom} 0%, ${config.bgTo} 100%)`,
      border: '2px solid var(--p-500)',
      borderRadius: 16,
      boxShadow: `0 0 0 3px #fff, 0 0 0 4.5px var(--p-500), 0 12px 24px -8px ${config.glowColor}`,
      overflow: 'hidden',
    }}>

      {/* 파트너 찌르기 알림 */}
      {pokeReceived && (
        <div style={{
          background: 'linear-gradient(90deg, #f39c12, #e67e22)',
          padding: '8px 14px', fontSize: 13, fontWeight: 700, color: '#fff',
          textShadow: '1px 1px 0 rgba(0,0,0,.3)',
          display: 'flex', alignItems: 'center', gap: 6,
          animation: 'pop .3s',
        }}>
          <span style={{ fontSize: 16 }}>👈</span>
          파트너가 당신을 콕 찔렀어요! 몬스터 HP -5
        </div>
      )}

      {/* 타이틀 바 */}
      <div style={{
        background: 'rgba(0,0,0,.3)',
        padding: '7px 14px',
        borderBottom: `1px solid ${config.color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span className="pixel" style={{ fontSize: 10, color: config.color, letterSpacing: 2, opacity: .85 }}>
          MONSTER ALERT
        </span>
        <span style={{
          background: config.color,
          color: '#fff', fontSize: 12, fontWeight: 700,
          padding: '2px 10px', borderRadius: 999, fontFamily: 'var(--font-pixel)',
          boxShadow: `0 0 8px ${config.glowColor}`,
        }}>
          {hp} HP
        </span>
      </div>

      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* 몬스터 비주얼 + 기본 정보 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* 픽셀아트 몬스터 */}
          <div style={{
            width: 80, height: 80, borderRadius: 14, flexShrink: 0,
            background: 'rgba(0,0,0,.35)',
            border: `1.5px solid ${config.color}55`,
            boxShadow: `0 0 16px ${config.glowColor}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: pokeAnim ? 'wiggle .4s' : 'float-y 3s ease-in-out infinite',
          }}>
            <MonsterArt />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ color: config.color, fontSize: 10, fontFamily: 'var(--font-pixel)', marginBottom: 2, letterSpacing: 1 }}>
              {config.subtitle}
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', textShadow: `0 0 10px ${config.glowColor}`, lineHeight: 1.2, marginBottom: 4 }}>
              {config.name}
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.5 }}>
              {config.description}
            </div>
          </div>
        </div>

        {/* HP 바 */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 5 }}>
            <span className="pixel" style={{ color: config.color }}>HP</span>
            <span className="screen" style={{ color: '#fff', fontSize: 14 }}>{hp} / {maxHp}</span>
          </div>
          <div style={{
            display: 'flex', gap: 2, padding: 3, borderRadius: 999,
            border: `1px solid ${config.color}44`,
            background: 'rgba(0,0,0,.4)',
          }}>
            {Array.from({ length: segs }).map((_, i) => (
              <div key={i} style={{
                flex: 1, height: 10,
                background: i < filled ? hpColor : 'rgba(255,255,255,.08)',
                boxShadow: i < filled ? `inset 0 1px 0 rgba(255,255,255,.4), 0 0 4px ${hpColor}66` : 'none',
                borderRadius: i === 0 ? '999px 2px 2px 999px' : i === segs - 1 ? '2px 999px 999px 2px' : 2,
                transition: 'background .3s',
              }}/>
            ))}
          </div>
        </div>

        {/* 콕콕 찌르기 버튼 */}
        <div style={{
          background: 'rgba(255,255,255,.06)',
          border: `1px solid ${config.color}44`,
          borderRadius: 14, padding: '12px 14px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div className="pixel" style={{ fontSize: 10, color: config.color, letterSpacing: 1 }}>
            ♡ 파트너 깨우기
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', lineHeight: 1.5, marginBottom: 2 }}>
            화가 났거나 연결이 필요할 때, 말 대신 파트너 캐릭터를 콕 찔러보세요.
            파트너에게 알림이 가고 몬스터 HP가 -5 줄어요.
          </div>
          <button
            onClick={handlePoke}
            disabled={poking || pokeDone}
            style={{
              background: pokeDone
                ? 'rgba(255,255,255,.1)'
                : `linear-gradient(180deg, ${config.color}cc, ${config.color})`,
              color: '#fff',
              border: `2px solid ${pokeDone ? 'rgba(255,255,255,.2)' : config.color}`,
              borderRadius: 999,
              boxShadow: pokeDone ? 'none' : `0 0 12px ${config.glowColor}, 0 0 0 2px rgba(255,255,255,.1)`,
              padding: '10px 0', width: '100%',
              fontSize: 14, fontFamily: 'var(--font-round)', fontWeight: 700,
              cursor: pokeDone ? 'default' : 'pointer',
              opacity: poking ? .7 : 1,
              transition: 'all .2s',
              textShadow: '1px 1px 0 rgba(0,0,0,.3)',
            }}
          >
            {poking ? '찌르는 중…' : pokeDone ? '✓ 찌르기 완료! (-5 HP)' : '👉 콕콕 찌르기'}
          </button>
        </div>

        {/* 약점 + 추천 멘트 */}
        <div style={{
          background: 'rgba(255,255,255,.05)',
          border: `1px solid ${config.color}33`,
          borderRadius: 12, padding: '10px 12px',
        }}>
          <div className="pixel" style={{ fontSize: 10, color: config.color, marginBottom: 6, letterSpacing: 1 }}>
            ★ 약점 — {config.theory}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.7)', lineHeight: 1.6, marginBottom: 10 }}>
            {config.weakness}
          </div>
          <div className="pixel" style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', marginBottom: 6, letterSpacing: 1 }}>
            추천 멘트
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {config.skills.map((skill, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,.07)',
                border: `1px solid ${config.color}22`,
                borderRadius: 8, padding: '7px 10px',
                fontSize: 12, color: 'rgba(255,255,255,.8)', lineHeight: 1.5,
              }}>
                {skill}
              </div>
            ))}
          </div>
        </div>

        <div className="pixel" style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', textAlign: 'center' }}>
          ▸ 퀘스트 완료 시 -20 HP · 찌르기 -5 HP
        </div>
      </div>
    </div>
  )
}
