import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>

      {/* 큰 로고 */}
      <div style={{
        background: 'linear-gradient(180deg, #fff5fa, #ffd6e8)',
        border: '2px solid var(--p-500)', borderRadius: 24,
        boxShadow: '0 0 0 4px #fff, 0 0 0 5.5px var(--p-500), 0 16px 32px -10px rgba(238,131,177,.45)',
        padding: '28px 36px', textAlign: 'center', maxWidth: 380, width: '100%',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* sparkle 데코 */}
        <span style={{ position: 'absolute', top: 14, left: 16, fontSize: 12, color: 'var(--p-500)', animation: 'twinkle 2s infinite' }}>✦</span>
        <span style={{ position: 'absolute', top: 24, right: 20, fontSize: 10, color: 'var(--blue-2)', animation: 'twinkle 1.6s .5s infinite' }}>✦</span>
        <span style={{ position: 'absolute', bottom: 18, right: 14, fontSize: 14, color: 'var(--p-400)', animation: 'twinkle 2.4s .3s infinite' }}>★</span>

        <div className="pixel" style={{ fontSize: 10, color: 'var(--p-700)', letterSpacing: 2, opacity: .7, marginBottom: 6 }}>
          ✿ y2k love-os ✿
        </div>
        <div className="cursive" style={{
          fontSize: 52, lineHeight: 1, color: 'var(--p-600)',
          textShadow: '2.5px 2.5px 0 #fff, 4px 4px 0 var(--p-500)',
          letterSpacing: -1, marginBottom: 4,
        }}>
          couple
        </div>
        <div className="cursive" style={{ fontSize: 28, color: 'var(--p-500)', textShadow: '1.5px 1.5px 0 #fff' }}>
          ♡ .exe
        </div>
        <div style={{ fontSize: 14, marginTop: 14, lineHeight: 1.7, color: 'var(--ink)' }}>
          둘이 따로 쓴 일기를 AI가 읽고,<br />
          <b style={{ color: 'var(--p-700)' }}>갈등 패턴</b>과
          <b style={{ color: 'var(--p-700)' }}> 속마음</b>을<br />
          게임 퀘스트로 풀어주는 앱
        </div>
        <div className="pixel" style={{ marginTop: 10, fontSize: 10, opacity: .5, letterSpacing: 1, color: 'var(--p-700)' }}>
          v0.2 PROTOTYPE · PRIVATE BETA
        </div>
      </div>

      {/* 버튼 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, width: '100%', maxWidth: 320 }}>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%', background: 'linear-gradient(180deg, #ffc8de, #ff9ec5)',
            color: '#fff', border: '2px solid #ee83b1', borderRadius: 999,
            boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px #ee83b1, 0 4px 0 -1px rgba(238,131,177,.3)',
            padding: '14px', fontSize: 16, fontFamily: 'var(--font-round)', fontWeight: 700,
            cursor: 'pointer', textShadow: '1px 1px 0 rgba(238,131,177,.5)',
          }}>
            ♡ 로그인
          </button>
        </Link>
        <Link href="/signup" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%', background: 'linear-gradient(180deg, #ffffff, #fff0f6)',
            color: 'var(--p-700)', border: '2px solid var(--p-500)', borderRadius: 999,
            boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px var(--p-500), 0 4px 0 -1px rgba(238,131,177,.2)',
            padding: '14px', fontSize: 16, fontFamily: 'var(--font-round)', fontWeight: 700,
            cursor: 'pointer', textShadow: '1px 1px 0 #fff',
          }}>
            처음이에요 → 회원가입
          </button>
        </Link>
      </div>

      {/* feature pills */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 20, maxWidth: 340, width: '100%' }}>
        {[
          { ic: '♡', t: '프라이빗', c: '#ffb6d0' },
          { ic: '◉', t: '패턴 분석', c: '#c8dcff' },
          { ic: '✿', t: '게임 퀘스트', c: '#e7d8ff' },
          { ic: '♥', t: '속마음 번역', c: '#ffd6e8' },
        ].map((f, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
            background: '#fff', border: `1.5px solid ${f.c}`, borderRadius: 14,
            boxShadow: `0 0 0 2.5px #fff, 0 0 0 4px ${f.c}`,
            fontSize: 13, color: 'var(--ink)', fontWeight: 700,
          }}>
            <span style={{ fontFamily: 'var(--font-screen)', fontSize: 16, color: 'var(--p-600)' }}>{f.ic}</span>
            {f.t}
          </div>
        ))}
      </div>

      {/* 마퀴 */}
      <div style={{
        marginTop: 24, maxWidth: 380, width: '100%',
        background: 'linear-gradient(90deg, var(--p-300), var(--p-400))',
        color: '#fff', textShadow: '1px 1px 0 rgba(238,131,177,.5)',
        border: '1.5px solid var(--p-500)', borderRadius: 99,
        boxShadow: '0 0 0 2.5px #fff, 0 0 0 4px var(--p-500)',
        padding: '6px 0', overflow: 'hidden',
        fontFamily: 'var(--font-cursive)', fontSize: 13, whiteSpace: 'nowrap',
      }}>
        <div style={{ display: 'inline-block', animation: 'marquee 22s linear infinite' }}>
          {'✿ made with love ✿ couple.exe ✿ don\'t fight, quest it ✿ AI reads ur diary so u don\'t have to ✿ y2k 4ever ✿ stay soft ✿'}
        </div>
      </div>
    </div>
  )
}
