"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  KawaiiChar, PuffyHeart, PixelStar, PixelSparkle, PixelHeart,
  PixelBar, PaperCard, PxButton, StickerBadge,
  PuffyStar, Bow, Cloud, BearFace, Sticker,
} from "@/components/y2k";

interface Props {
  nickname: string;
  partnerNickname: string;
  relHealth: number;
  streak: number;
  xp: number;
  level: number;
  myDiaryDone: boolean;
  partnerDone: boolean;
  bothWrote: boolean;
  hasCouple: boolean;
}

export default function HomeClient({
  nickname, partnerNickname, relHealth, streak, xp, level,
  myDiaryDone, partnerDone, bothWrote, hasCouple,
}: Props) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 700);
    return () => clearInterval(t);
  }, []);

  const status =
    relHealth > 75 ? "최고조 ♡" :
    relHealth > 50 ? "살짝 삐걱" :
    relHealth > 25 ? "냉전 진입" : "비상 사태";

  return (
    <div style={{ padding: "0 16px 48px" }}>

      {/* 커플 미연결 */}
      {!hasCouple && (
        <Link href="/couple" style={{ textDecoration: "none", display: "block", marginBottom: 14 }}>
          <div style={{
            background: "linear-gradient(135deg, #fff5fa, var(--lavender))",
            border: "1.5px solid var(--p-400)", borderRadius: 14, padding: "12px 16px",
            boxShadow: "0 0 0 3px #fff, 0 0 0 4.5px var(--p-400)",
          }}>
            <div style={{ fontWeight: 700, color: "var(--p-700)", fontSize: 14 }}>💑 파트너와 연결해주세요</div>
            <div style={{ fontSize: 12, color: "var(--ink-2)", marginTop: 4 }}>커플 코드로 연결하면 함께 리포트를 볼 수 있어요 →</div>
          </div>
        </Link>
      )}

      {/* 타마고치 디스플레이 */}
      <div style={{
        background: "linear-gradient(180deg, #fff0f6 0%, #ffe2ee 100%)",
        border: "1.5px solid var(--p-500)", borderRadius: 16,
        boxShadow: "0 0 0 3px #fff, 0 0 0 4.5px var(--p-500), inset 0 4px 10px rgba(255,182,208,.4)",
        padding: 18, position: "relative", overflow: "hidden",
      }}>
        {/* scanlines */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "repeating-linear-gradient(0deg, rgba(238,131,177,.06) 0 1px, transparent 1px 4px)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative" }}>
          <div>
            <div className="cursive" style={{ fontSize: 22, color: "var(--p-600)", lineHeight: 1, textShadow: "1.5px 1.5px 0 #fff" }}>
              today&apos;s us
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>오늘의 우리 ♡</div>
          </div>
          <StickerBadge>day {String(streak).padStart(3, "0")}</StickerBadge>
        </div>

        {/* 커플 캐릭터 */}
        <div style={{ display: "flex", justifyContent: "center", gap: 22, margin: "20px 0 14px", position: "relative" }}>
          <div style={{ textAlign: "center", transform: tick % 2 === 0 ? "translateY(-2px)" : "" }}>
            <KawaiiChar scale={4} hair="#6b4566" shirt="#ffb6d0" />
            <div style={{ fontSize: 12, marginTop: 4, fontWeight: 700, color: "var(--p-700)" }}>{nickname} ♀</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", animation: "heartbeat 1.6s infinite" }}>
            <PuffyHeart size={42} />
          </div>
          <div style={{ textAlign: "center", transform: tick % 2 === 1 ? "translateY(-2px)" : "" }}>
            <KawaiiChar scale={4} hair="#5a3a30" shirt="#c8dcff" skin="#fff0e6" />
            <div style={{ fontSize: 12, marginTop: 4, fontWeight: 700, color: "#4d6fb0" }}>{partnerNickname} ♂</div>
          </div>
          <PixelStar size={12} color="#ffb6d0" style={{ position: "absolute", top: 4, left: "20%", animation: "twinkle 2s infinite" }} />
          <PixelStar size={10} color="#ee83b1" style={{ position: "absolute", top: 24, right: "22%", animation: "twinkle 1.6s .4s infinite" }} />
          <PixelSparkle size={14} color="#ff9ec5" style={{ position: "absolute", bottom: 0, left: "32%" }} />
        </div>

        <PixelBar value={relHealth} color="#ffb6d0" label={<>♡ 관계 체력</>} />
        <div style={{ marginTop: 10 }}>
          <PixelBar value={Math.min(streak * 5, 100)} max={100} color="#c8dcff" label="✿ 퀘스트 연속" />
        </div>

        <div style={{
          marginTop: 14, padding: "8px 12px",
          background: "#fff", border: "1.5px dashed var(--p-500)",
          borderRadius: 10, textAlign: "center",
          fontFamily: "var(--font-screen)", fontSize: 18, color: "var(--ink)",
        }}>
          ▸ status: <span style={{ color: "var(--p-700)" }}>{status}</span>
        </div>
      </div>

      {/* 퀵 액션 카드 2개 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <PaperCard color="#fff5fa" accent="#ffb6d0">
          <div className="cursive" style={{ color: "var(--p-600)", fontSize: 15 }}>today&apos;s quest</div>
          <div style={{ fontSize: 13, fontWeight: 700, margin: "6px 0", lineHeight: 1.4 }}>
            {bothWrote ? "퀘스트가\n기다려요" : "둘 다 일기\n먼저 써요"}
          </div>
          <Link href="/today">
            <PxButton size="sm" color="pink" style={{ whiteSpace: "nowrap" }}>보러가기 →</PxButton>
          </Link>
        </PaperCard>
        <PaperCard color="#fff" accent="#c8dcff">
          <div className="cursive" style={{ color: "#4d6fb0", fontSize: 15 }}>diary</div>
          <div style={{ fontSize: 13, fontWeight: 700, margin: "6px 0", lineHeight: 1.4 }}>
            {myDiaryDone ? "오늘 일기\n완료 ✓" : "오늘 일기\n아직 안 썼어요"}
          </div>
          <Link href="/diary/new">
            <PxButton size="sm" color={myDiaryDone ? "soft" : "blue"} style={{ whiteSpace: "nowrap" }}>
              {myDiaryDone ? "수정하기" : "지금 쓰기"}
            </PxButton>
          </Link>
        </PaperCard>
      </div>

      {/* AI 알림 카드 */}
      <div style={{ marginTop: 14 }}>
        <PaperCard color="#fff" accent="#ffb6d0" title={<><PixelHeart size={12} /> AI 알림</>}>
          <div style={{ fontSize: 13, lineHeight: 1.7 }}>
            {bothWrote
              ? <>오늘 두 분의 일기를 분석했어요. <b style={{ background: "#ffb6d0", color: "#fff", padding: "1px 6px", borderRadius: 6 }}>리포트</b>를 확인해보세요!</>
              : <>일기를 모두 작성하면 <b style={{ background: "#ffb6d0", color: "#fff", padding: "1px 6px", borderRadius: 6 }}>AI 분석</b>이 시작돼요.</>
            }
          </div>
          {bothWrote && (
            <div style={{ marginTop: 10 }}>
              <Link href="/today">
                <PxButton size="sm" color="white">분석 결과 보기 →</PxButton>
              </Link>
            </div>
          )}
        </PaperCard>
      </div>

      {/* 커플 레벨 */}
      <div style={{ marginTop: 14 }}>
        <PaperCard color="#fff" accent="#e7d8ff" title={<>✦ 커플 레벨</>} titleColor="linear-gradient(90deg,#f3eaff,#e7d8ff)">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--ink-2)" }}>Lv.{level}</span>
            <span className="screen" style={{ fontSize: 16, color: "var(--p-700)" }}>{xp} XP</span>
          </div>
          <PixelBar value={xp} max={100 + (level - 1) * 150} color="#e7d8ff" />
        </PaperCard>
      </div>

      {/* 커플 코드 */}
      {hasCouple && (
        <div style={{ marginTop: 14, textAlign: "center" }}>
          <Link href="/couple">
            <span className="pixel" style={{ fontSize: 11, color: "var(--p-500)" }}>커플 코드 관리 ✿</span>
          </Link>
        </div>
      )}

      {/* 마퀴 */}
      <div style={{
        marginTop: 20,
        background: "linear-gradient(90deg, var(--p-300), var(--p-400))",
        color: "#fff", border: "1.5px solid var(--p-500)", borderRadius: 99,
        boxShadow: "0 0 0 2.5px #fff, 0 0 0 4px var(--p-500)",
        padding: "6px 0", overflow: "hidden",
        fontFamily: "var(--font-cursive)", fontSize: 13, whiteSpace: "nowrap",
      }}>
        <div style={{ display: "inline-block", animation: "marquee 22s linear infinite" }}>
          {"✿ made with love ✿ couple.exe ✿ don't fight, quest it ✿ AI reads ur diary so u don't have to ✿ y2k 4ever ✿ stay soft ✿"}
        </div>
      </div>
    </div>
  );
}
