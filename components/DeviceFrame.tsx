'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  PuffyHeart, PuffyStar, Bow, Cloud, BearFace,
  StickerBadge, PixelSparkle, PixelStar,
} from '@/components/y2k'
import { signOut } from '@/app/actions/auth'

const TABS = [
  { id: 'home',   label: '홈',    icon: '♡', href: '/home' },
  { id: 'diary',  label: '일기',  icon: '✎', href: '/diary/new' },
  { id: 'ai',     label: '분석',  icon: '◉', href: '/today' },
  { id: 'quest',  label: '퀘스트', icon: '✿', href: '/today' },
  { id: 'couple', label: '커플',  icon: '♥', href: '/couple' },
]

interface Props {
  children: React.ReactNode
  relHealth?: number
  xp?: number
  streak?: number
  nickname?: string
}

export default function DeviceFrame({
  children, relHealth = 0, xp = 0, streak = 0, nickname = '',
}: Props) {
  const pathname = usePathname()
  const [time, setTime] = useState('')
  useEffect(() => {
    function tick() {
      const d = new Date()
      setTime(`${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`)
    }
    tick()
    const t = setInterval(tick, 60_000)
    return () => clearInterval(t)
  }, [])

  const activeTabId =
    pathname.startsWith('/diary') ? 'diary' :
    pathname === '/today'  ? 'ai' :
    pathname === '/couple' ? 'couple' : 'home'

  const activeLabel = TABS.find(t => t.id === activeTabId)?.label ?? '홈'

  return (
    <>
      {/* 반응형 스타일 */}
      <style>{`
        .device-layout {
          display: grid;
          grid-template-columns: 460px 1fr;
          gap: 28px;
          align-items: start;
          width: 100%;
          max-width: 1140px;
        }
        .device-sidebar { display: flex; flex-direction: column; gap: 18px; padding-top: 8px; }
        .device-sticker { pointer-events: none; }
        @media (max-width: 860px) {
          .device-layout { grid-template-columns: 1fr; }
          .device-sidebar { display: none; }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: '32px 16px 80px',
      }}>
        <div className="device-layout">

          {/* ====== 왼쪽: 디바이스 ====== */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>

            {/* 떠다니는 스티커 (pointer-events:none으로 클릭 통과) */}
            {[
              { top: -10, left: -30, rotate: -12, delay: 0,   size: 70, el: <PuffyHeart size={70} /> },
              { top: 130, left: -50, rotate:  18, delay: 1,   size: 56, el: <PuffyStar size={56} /> },
              { top: 420, left: -46, rotate:  -8, delay: 0.5, size: 66, el: <Bow size={66} /> },
              { bottom: 60,  left: -26, rotate: 10, delay: 1.5, size: 50, el: <PuffyHeart size={50} color="#e7d8ff" /> },
              { top: 20,  right: -26, rotate:  14, delay: 0.8, size: 56, el: <PuffyStar size={56} color="#c8dcff" outline="#a8c4f5" /> },
              { top: 290, right: -50, rotate: -12, delay: 0.2, size: 72, el: <PuffyHeart size={72} /> },
              { bottom: 140, right: -32, rotate: -22, delay: 1.2, size: 58, el: <Cloud size={58} /> },
              { bottom: 20,  right: -10, rotate:   6, delay: 2,   size: 42, el: <BearFace size={42} /> },
            ].map((s, i) => (
              <div key={i} className="device-sticker" style={{
                position: 'absolute',
                top: s.top, left: (s as any).left, right: (s as any).right, bottom: (s as any).bottom,
                width: s.size, height: s.size,
                transform: `rotate(${s.rotate}deg)`,
                animation: `float-y 4.5s ease-in-out ${s.delay}s infinite`,
                zIndex: 0,
                filter: 'drop-shadow(0 4px 6px rgba(238,131,177,.3))',
              }}>{s.el}</div>
            ))}

            {/* 디바이스 바디 */}
            <div style={{
              width: '100%', maxWidth: 460, position: 'relative', zIndex: 1,
              background: 'linear-gradient(155deg, #fff5fa 0%, #ffd6e8 50%, #ffb6d0 100%)',
              border: '2px solid #ff9ec5',
              borderRadius: '36px 36px 32px 32px',
              padding: '20px 22px 26px',
              boxShadow:
                'inset 0 4px 0 rgba(255,255,255,.7), inset 0 -8px 0 rgba(238,131,177,.18),' +
                '0 0 0 4px #fff, 0 0 0 5.5px #ff9ec5, 0 16px 30px -10px rgba(238,131,177,.5)',
            }}>

              {/* 스피커 그릴 + 브랜드 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', gap: 4, padding: '4px 8px', background: 'rgba(255,255,255,.6)', border: '1.2px solid #ff9ec5', borderRadius: 99 }}>
                  {Array.from({ length: 7 }).map((_, i) => (
                    <div key={i} style={{ width: 4.5, height: 4.5, borderRadius: '50%', background: '#ff9ec5' }} />
                  ))}
                </div>
                <div className="cursive" style={{ fontSize: 14, color: '#c66293', textShadow: '1.5px 1.5px 0 #fff' }}>
                  heart os
                </div>
                <StickerBadge color="#fff" textColor="#c66293" style={{ fontFamily: 'var(--font-pixel)', fontSize: 10, padding: '3px 10px' }}>
                  ●REC
                </StickerBadge>
              </div>

              {/* Win98 창 */}
              <div className="win" style={{ marginBottom: 14 }}>
                {/* 타이틀바 */}
                <div className="win-title">
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 18, height: 18,
                      background: 'linear-gradient(180deg,#fff,#ffd6e8)',
                      border: '1.2px solid #ff9ec5', borderRadius: 5,
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, color: '#c66293',
                    }}>♡</span>
                    커플.exe — {activeLabel}
                  </span>
                  <div className="win-buttons">
                    <button className="win-btn">_</button>
                    <button className="win-btn">▢</button>
                    <button className="win-btn" style={{ background: 'linear-gradient(180deg,#ffc8de,#ff9ec5)', color: '#fff' }}>×</button>
                  </div>
                </div>

                {/* 메뉴바 */}
                <div className="win-menu">
                  <span><u>F</u>ile</span>
                  <span><u>E</u>dit</span>
                  <span><u>V</u>iew</span>
                  {nickname && (
                    <span style={{ opacity: .75, fontWeight: 700, color: 'var(--p-700)' }}>
                      {nickname} ♡
                    </span>
                  )}
                  <span style={{ marginLeft: 'auto', fontSize: 11, opacity: .7 }} className="pixel">{time}</span>
                </div>

                {/* 본문 — maxHeight 제거, 자연스럽게 늘어남 */}
                <div className="win-body" style={{ position: 'relative' }}>
                  {children}
                </div>

                {/* 상태바 */}
                <div style={{
                  background: 'linear-gradient(90deg, #fff5fa, #ffe2ee)',
                  borderTop: '1.2px solid var(--p-300)',
                  display: 'flex', fontSize: 12, padding: '4px 0',
                  color: 'var(--p-700)', fontWeight: 700,
                }}>
                  <div style={{ flex: 1, padding: '2px 8px' }}>♡ HP {relHealth}% · XP {xp}</div>
                  <div style={{ padding: '2px 8px', borderLeft: '1px dashed var(--p-300)' }}>
                    {streak}일 연속 ✿
                  </div>
                  <form action={signOut} style={{ padding: '1px 8px', borderLeft: '1px dashed var(--p-300)' }}>
                    <button style={{
                      background: 'none', border: 'none', fontSize: 11,
                      color: 'var(--ink-2)', cursor: 'pointer',
                      fontFamily: 'var(--font-round)', padding: '1px 0',
                    }}>
                      로그아웃
                    </button>
                  </form>
                </div>
              </div>

              {/* 탭 버튼 */}
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${TABS.length}, 1fr)`, gap: 6, marginBottom: 14 }}>
                {TABS.map(t => {
                  const active = t.id === activeTabId
                  return (
                    <Link key={t.id} href={t.href} style={{ textDecoration: 'none' }}>
                      <button style={{
                        width: '100%',
                        background: active
                          ? 'linear-gradient(180deg, #ffc8de, #ff9ec5)'
                          : 'linear-gradient(180deg, #fff, #fff5fa)',
                        color: active ? '#fff' : 'var(--p-700)',
                        border: '1.5px solid #ff9ec5', borderRadius: 14,
                        boxShadow: active
                          ? 'inset 0 2px 4px rgba(238,131,177,.4), 0 0 0 2px #fff, 0 0 0 3.2px #ff9ec5'
                          : '0 0 0 2px #fff, 0 0 0 3.2px #ff9ec5, 0 3px 0 -1px rgba(238,131,177,.25)',
                        padding: '8px 2px',
                        fontFamily: 'var(--font-round)', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                        transform: active ? 'translateY(2px)' : 'none',
                        transition: 'transform .08s',
                        textShadow: active ? '1px 1px 0 rgba(238,131,177,.5)' : '1px 1px 0 #fff',
                      }}>
                        <span className="screen" style={{ fontSize: 17, lineHeight: 1, color: active ? '#fff' : '#ee83b1' }}>{t.icon}</span>
                        <span style={{ whiteSpace: 'nowrap' }}>{t.label}</span>
                      </button>
                    </Link>
                  )
                })}
              </div>

              {/* D-pad + 로고 + A/B */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* D-pad */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 28px)', gridTemplateRows: 'repeat(3, 28px)', gap: 1 }}>
                  {[null,'▲',null,'◀','♡','▶',null,'▼',null].map((c, i) => (
                    <div key={i} style={{
                      background: c === '♡' ? 'linear-gradient(180deg,#ffd6e8,#ff9ec5)' : c ? 'linear-gradient(180deg,#fff,#ffe2ee)' : 'transparent',
                      color: c === '♡' ? '#fff' : '#c66293',
                      border: c ? '1.2px solid #ff9ec5' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, borderRadius: c === '♡' ? 8 : 4,
                      textShadow: '1px 1px 0 #fff',
                    }}>{c}</div>
                  ))}
                </div>

                {/* 로고 */}
                <div style={{ textAlign: 'center' }}>
                  <div className="cursive" style={{ fontSize: 18, color: '#c66293', textShadow: '2px 2px 0 #fff', lineHeight: 1 }}>
                    couple ♡
                  </div>
                  <div className="pixel" style={{ fontSize: 9, color: '#c66293', opacity: .7, marginTop: 4, letterSpacing: 1 }}>
                    EST · 2026 · MADE 4 U
                  </div>
                </div>

                {/* A/B 버튼 */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {['B', 'A'].map(L => (
                    <div key={L} style={{
                      width: 38, height: 38, borderRadius: '50%',
                      background: 'radial-gradient(circle at 35% 30%, #fff 0%, #ffd6e8 50%, #ff9ec5 100%)',
                      border: '1.5px solid #ee83b1',
                      boxShadow: '0 0 0 2px #fff, 0 0 0 3.2px #ee83b1, 0 4px 0 -1px rgba(238,131,177,.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-round)', fontWeight: 700,
                      fontSize: 14, color: '#c66293', textShadow: '1px 1px 0 #fff',
                    }}>{L}</div>
                  ))}
                </div>
              </div>

              {/* 랜야드 홀 */}
              <div style={{
                position: 'absolute', top: -2, right: 36,
                width: 14, height: 14, borderRadius: '50%',
                background: '#fff', border: '2px solid #ee83b1',
              }} />
            </div>
          </div>

          {/* ====== 오른쪽: 사이드바 ====== */}
          <div className="device-sidebar">

            {/* 로고 카드 */}
            <div className="sticker" style={{ padding: 0, overflow: 'hidden', borderRadius: 20 }}>
              <div style={{ background: 'linear-gradient(180deg, #fff5fa, #ffd6e8)', padding: '20px 18px 22px', textAlign: 'center', position: 'relative' }}>
                <div className="cursive" style={{ fontSize: 13, color: '#c66293', letterSpacing: 1, textShadow: '1px 1px 0 #fff', marginBottom: 4 }}>
                  ✦ y2k love-os ✦
                </div>
                <div className="cursive" style={{ fontSize: 50, lineHeight: 1, color: '#ee83b1', textShadow: '2.5px 2.5px 0 #fff, 4px 4px 0 #ff9ec5', letterSpacing: -1 }}>
                  couple
                  <span style={{ display: 'inline-block', margin: '0 5px', animation: 'wiggle 1.6s infinite', verticalAlign: 'middle' }}>
                    <PuffyHeart size={32} />
                  </span>
                  <span style={{ fontSize: 32 }}>.exe</span>
                </div>
                <div style={{ fontSize: 13, marginTop: 12, lineHeight: 1.7, color: 'var(--ink)' }}>
                  둘이 따로 쓴 일기를 AI가 읽고,<br />
                  <b style={{ color: 'var(--p-700)' }}>갈등 패턴</b>과
                  <b style={{ color: 'var(--p-700)' }}> 속마음</b>을<br />
                  게임 퀘스트로 풀어주는 앱
                </div>
                <div className="pixel" style={{ marginTop: 12, fontSize: 10, opacity: .5, letterSpacing: 1, color: 'var(--p-700)' }}>
                  v0.2 PROTOTYPE · PRIVATE BETA
                </div>
                <PixelSparkle size={12} color="#ff9ec5" style={{ position: 'absolute', top: 14, left: 18, animation: 'twinkle 2s infinite' }} />
                <PixelSparkle size={10} color="#a8c4f5" style={{ position: 'absolute', top: 28, right: 22, animation: 'twinkle 1.6s .5s infinite' }} />
                <PixelStar size={14} color="#ffb6d0" style={{ position: 'absolute', bottom: 14, right: 16, animation: 'twinkle 2.4s .3s infinite' }} />
              </div>
            </div>

            {/* 기능 pills */}
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { ic: '♡', t: '프라이빗',    d: '각자 일기는 절대 서로에게 안 보여요. AI만 읽음.', c: '#ffb6d0' },
                { ic: '◉', t: '패턴 분석',   d: '회피 vs 직면, 단어 빈도, 침묵 길이까지 추적.',   c: '#c8dcff' },
                { ic: '✿', t: '게임 퀘스트', d: '패턴별 미션과 XP, 관계 HP 회복.',               c: '#e7d8ff' },
                { ic: '♥', t: '속마음 번역', d: '\'괜찮아\' → \'사실 서운해\' 같은 진짜 감정.',   c: '#ffd6e8' },
              ].map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', background: '#fff',
                  border: `1.5px solid ${f.c}`, borderRadius: 14,
                  boxShadow: `0 0 0 2.5px #fff, 0 0 0 4px ${f.c}, 0 3px 6px -2px rgba(238,131,177,.25)`,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(180deg, #fff, ${f.c})`,
                    border: `1.2px solid ${f.c}`,
                    fontFamily: 'var(--font-screen)', fontSize: 20, color: 'var(--p-700)',
                    textShadow: '1px 1px 0 #fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{f.ic}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{f.t}</div>
                    <div style={{ fontSize: 11.5, lineHeight: 1.55, opacity: .8 }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* 팔레트 카드 */}
            <div className="sticker" style={{ padding: 14, background: 'linear-gradient(180deg,#fff,#fff5fa)' }}>
              <div className="cursive" style={{ fontSize: 16, color: '#c66293', textShadow: '1px 1px 0 #fff', marginBottom: 8 }}>
                color palette
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                {[['#fff5fa','cream'],['#ffd6e8','baby'],['#ffb6d0','blush'],['#ff9ec5','sticker'],['#c8dcff','blue'],['#e7d8ff','lilac']].map(([c, n]) => (
                  <div key={c} style={{
                    flex: 1, height: 40, background: c,
                    border: '1.2px solid #ff9ec5', borderRadius: 8,
                    boxShadow: '0 0 0 1.5px #fff, 0 0 0 2.5px #ff9ec5',
                    fontSize: 9, fontFamily: 'var(--font-pixel)', color: '#c66293',
                    textShadow: '1px 1px 0 #fff',
                    display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 3,
                  }}>{n}</div>
                ))}
              </div>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--ink)' }}>
                ▸ Soft pink + cream + sky-blue accents<br />
                ▸ Pacifico · Gaegu · DotGothic16<br />
                ▸ White halo + pink outline = sticker effect
              </div>
            </div>

            {/* 마퀴 */}
            <div style={{
              background: 'linear-gradient(90deg, #ffd6e8, #ffb6d0)',
              color: '#fff', textShadow: '1px 1px 0 rgba(238,131,177,.5)',
              border: '1.5px solid #ff9ec5', borderRadius: 99,
              boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px #ff9ec5',
              padding: '6px 0', overflow: 'hidden',
              fontFamily: 'var(--font-cursive)', fontSize: 14, letterSpacing: 1,
              whiteSpace: 'nowrap',
            }}>
              <div style={{ display: 'inline-block', animation: 'marquee 24s linear infinite' }}>
                ✿ made with love ✿ couple.exe ✿ don&apos;t fight, quest it ✿ AI reads ur diary so u don&apos;t have to ✿ y2k 4ever ✿ stay soft ✿
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
