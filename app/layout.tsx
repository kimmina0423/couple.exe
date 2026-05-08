import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '커플.exe — 우리 사이',
  description: '둘이 따로 쓴 일기를 AI가 읽고, 갈등 패턴과 속마음을 게임 퀘스트로 풀어주는 앱',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DotGothic16&family=Gaegu:wght@400;700&family=Yeon+Sung&family=Pacifico&family=Caveat:wght@500;700&family=VT323&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ position: 'relative', zIndex: 1 }}>{children}</body>
    </html>
  )
}
