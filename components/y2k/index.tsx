"use client";

import React from "react";

/* ── pixel sprites ── */
function makePixelSvg(grid: string[], w: number, h: number, size: number, color: string, style?: React.CSSProperties) {
  return (
    <svg width={size} height={size * h / w} viewBox={`0 0 ${w} ${h}`}
      style={{ shapeRendering: "crispEdges", display: "inline-block", verticalAlign: "middle", ...style }}>
      {grid.map((row, y) => row.split("").map((c, x) =>
        c === "1" ? <rect key={`${x}_${y}`} x={x} y={y} width="1" height="1" fill={color} /> : null
      ))}
    </svg>
  );
}

export const PixelHeart = ({ size = 16, color = "#ff9ec5", style }: { size?: number; color?: string; style?: React.CSSProperties }) =>
  makePixelSvg(["0110110","1111111","1111111","0111110","0011100","0001000"], 7, 6, size, color, style);

export const PixelStar = ({ size = 14, color = "#ffb6d0", style }: { size?: number; color?: string; style?: React.CSSProperties }) =>
  makePixelSvg(["0001000","0001000","1111111","0111110","0011100","0110110","1100011"], 7, 7, size, color, style);

export const PixelSparkle = ({ size = 12, color = "#ff9ec5", style }: { size?: number; color?: string; style?: React.CSSProperties }) =>
  makePixelSvg(["0010100","0010100","0011100","1111111","0011100","0010100","0010100"], 7, 7, size, color, style);

/* ── puffy stickers ── */
export const PuffyHeart = ({ size = 60, color = "#ffb6d0" }: { size?: number; color?: string }) => (
  <svg viewBox="0 0 36 32" width={size} height={size * 32 / 36}>
    <defs>
      <radialGradient id={`ph-${color.replace("#","")}`} cx="35%" cy="30%">
        <stop offset="0%" stopColor="#fff" stopOpacity=".95" />
        <stop offset="40%" stopColor={color} stopOpacity=".7" />
        <stop offset="100%" stopColor={color} />
      </radialGradient>
    </defs>
    <path d="M18 30 C 4 22, 0 14, 0 9 C 0 3, 4 0, 9 0 C 13 0, 16 2, 18 5 C 20 2, 23 0, 27 0 C 32 0, 36 3, 36 9 C 36 14, 32 22, 18 30 Z"
      fill={`url(#ph-${color.replace("#","")})`} stroke="#ff9ec5" strokeWidth="1.2" />
    <ellipse cx="9" cy="7" rx="3" ry="2" fill="#fff" opacity=".85" />
    <ellipse cx="13" cy="11" rx="1.5" ry="1" fill="#fff" opacity=".6" />
  </svg>
);

export const PuffyStar = ({ size = 48, color = "#ffd6e8", outline = "#ff9ec5" }: { size?: number; color?: string; outline?: string }) => (
  <svg viewBox="0 0 24 24" width={size} height={size}>
    <path d="M12 2 L14.5 9 L22 9.5 L16 14 L18 21.5 L12 17.5 L6 21.5 L8 14 L2 9.5 L9.5 9 Z"
      fill={color} stroke={outline} strokeWidth="1.4" strokeLinejoin="round" />
    <circle cx="9" cy="8" r="1.2" fill="#fff" opacity=".9" />
  </svg>
);

export const Bow = ({ size = 56, color = "#ffd0e2" }: { size?: number; color?: string }) => (
  <svg viewBox="0 0 44 28" width={size} height={size * 28 / 44}>
    <ellipse cx="11" cy="14" rx="11" ry="11" fill={color} stroke="#ff9ec5" strokeWidth="1.5" />
    <ellipse cx="33" cy="14" rx="11" ry="11" fill={color} stroke="#ff9ec5" strokeWidth="1.5" />
    <rect x="19" y="7" width="6" height="14" rx="2" fill={color} stroke="#ff9ec5" strokeWidth="1.5" />
    <ellipse cx="11" cy="14" rx="3" ry="6" fill="#fff" opacity=".5" />
    <ellipse cx="33" cy="14" rx="3" ry="6" fill="#fff" opacity=".5" />
  </svg>
);

export const Cloud = ({ size = 60 }: { size?: number }) => (
  <svg viewBox="0 0 60 36" width={size} height={size * 36 / 60}>
    <ellipse cx="14" cy="22" rx="12" ry="10" fill="#fff" stroke="#ff9ec5" strokeWidth="1.5" />
    <ellipse cx="28" cy="14" rx="14" ry="12" fill="#fff" stroke="#ff9ec5" strokeWidth="1.5" />
    <ellipse cx="46" cy="20" rx="12" ry="11" fill="#fff" stroke="#ff9ec5" strokeWidth="1.5" />
    <rect x="3" y="22" width="54" height="12" fill="#fff" />
  </svg>
);

export const BearFace = ({ size = 36 }: { size?: number }) => (
  <svg viewBox="0 0 32 28" width={size} height={size * 28 / 32}>
    <circle cx="6" cy="8" r="5" fill="#ffe2ee" stroke="#ff9ec5" strokeWidth="1.4" />
    <circle cx="26" cy="8" r="5" fill="#ffe2ee" stroke="#ff9ec5" strokeWidth="1.4" />
    <circle cx="16" cy="16" r="11" fill="#fff5fa" stroke="#ff9ec5" strokeWidth="1.5" />
    <circle cx="12" cy="14" r="1.4" fill="#6b4566" />
    <circle cx="20" cy="14" r="1.4" fill="#6b4566" />
    <circle cx="9" cy="18" r="1.4" fill="#ffb6d0" opacity=".8" />
    <circle cx="23" cy="18" r="1.4" fill="#ffb6d0" opacity=".8" />
    <path d="M14 19 q2 2 4 0" stroke="#6b4566" strokeWidth="1.2" fill="none" strokeLinecap="round" />
  </svg>
);

export const KawaiiChar = ({ scale = 4, hair = "#6b4566", shirt = "#ffb6d0", skin = "#fff0e6", style }: {
  scale?: number; hair?: string; shirt?: string; skin?: string; style?: React.CSSProperties;
}) => {
  const G = [
    "00001111110000","00012222221000","00122222222100","01222222222210",
    "12233333333221","12333335333321","12363353533631","12333666333321",
    "12333333333321","01233355533210","00123333332100","00012444421000",
    "00144444444100","01444444444410","01444444444410","01111111111110",
  ];
  const colors: Record<string, string> = { "0":"transparent","1":"#ff9ec5","2":hair,"3":skin,"4":shirt,"5":"#ffb6d0","6":"#6b4566" };
  return (
    <svg width={14*scale} height={16*scale} viewBox="0 0 14 16"
      style={{ shapeRendering: "crispEdges", display: "inline-block", ...style }}>
      {G.map((row, y) => row.split("").map((c, x) =>
        c !== "0" ? <rect key={`${x}_${y}`} x={x} y={y} width="1" height="1" fill={colors[c]} /> : null
      ))}
    </svg>
  );
};

/* ── buttons ── */
type BtnColor = "pink" | "white" | "blue" | "soft";
type BtnSize = "sm" | "md" | "lg";
const PALETTE: Record<BtnColor, { bg: string; outline: string; text: string }> = {
  pink:  { bg: "linear-gradient(180deg, #ffc8de, #ff9ec5)", outline: "#ee83b1", text: "#fff" },
  white: { bg: "linear-gradient(180deg, #ffffff, #fff0f6)", outline: "#ff9ec5", text: "#c66293" },
  blue:  { bg: "linear-gradient(180deg, #d8eaff, #b6c8f0)", outline: "#a8c4f5", text: "#4d6fb0" },
  soft:  { bg: "linear-gradient(180deg, #fff0f6, #ffe2ee)", outline: "#ffb6d0", text: "#c66293" },
};
const SIZES: Record<BtnSize, { pad: string; fs: number }> = {
  sm: { pad: "6px 14px", fs: 13 },
  md: { pad: "10px 20px", fs: 15 },
  lg: { pad: "14px 26px", fs: 17 },
};

export const PxButton = ({ children, color = "pink", size = "md", onClick, style = {}, disabled, type = "button" }: {
  children: React.ReactNode; color?: BtnColor; size?: BtnSize;
  onClick?: () => void; style?: React.CSSProperties; disabled?: boolean; type?: "button" | "submit";
}) => {
  const p = PALETTE[color]; const s = SIZES[size];
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      background: p.bg, color: p.text,
      border: `2px solid ${p.outline}`,
      boxShadow: `0 0 0 2.5px #fff, 0 0 0 4px ${p.outline}, 0 4px 0 -1px ${p.outline}55`,
      padding: s.pad, fontSize: s.fs,
      fontFamily: "var(--font-round)", fontWeight: 700,
      cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .55 : 1,
      borderRadius: 999,
      textShadow: p.text === "#fff" ? "1px 1px 0 rgba(238,131,177,.6)" : "1px 1px 0 #fff",
      letterSpacing: ".5px", transition: "transform .08s",
      ...style,
    }}>{children}</button>
  );
};

/* ── floating sticker wrapper ── */
export const Sticker = ({ children, top, left, right, bottom, rotate = 0, size = 64, delay = 0 }: {
  children: React.ReactNode; top?: number | string; left?: number | string;
  right?: number | string; bottom?: number | string; rotate?: number; size?: number; delay?: number;
}) => (
  <div style={{
    position: "absolute", top, left, right, bottom,
    width: size, height: size,
    transform: `rotate(${rotate}deg)`,
    animation: `float-y 4.5s ease-in-out ${delay}s infinite`,
    pointerEvents: "none", zIndex: 5,
    filter: "drop-shadow(0 4px 6px rgba(238,131,177,.3))",
  }}>{children}</div>
);

/* ── pixel progress bar ── */
export const PixelBar = ({ value, max = 100, color = "#ff9ec5", label, sub }: {
  value: number; max?: number; color?: string; label?: React.ReactNode; sub?: string;
}) => {
  const segs = 16;
  const filled = Math.round((Math.max(0, Math.min(100, (value / max) * 100)) / 100) * segs);
  return (
    <div>
      {label && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4, color: "var(--ink)", gap: 8 }}>
          <span style={{ fontWeight: 700 }}>{label}</span>
          <span className="screen" style={{ fontSize: 16, color: "var(--p-700)" }}>{value}<span style={{ opacity: .55 }}>/{max}</span></span>
        </div>
      )}
      <div style={{
        display: "flex", gap: 2, padding: 3, borderRadius: 999,
        border: "1.5px solid var(--p-500)",
        boxShadow: "inset 0 1px 2px rgba(238,131,177,.25), 0 0 0 2.5px #fff, 0 0 0 4px var(--p-500)",
        background: "#fff5fa", height: 18,
      }}>
        {Array.from({ length: segs }).map((_, i) => (
          <div key={i} style={{
            flex: 1,
            background: i < filled ? color : "transparent",
            boxShadow: i < filled ? "inset 0 -2px 0 rgba(238,131,177,.25), inset 0 1.5px 0 rgba(255,255,255,.55)" : "none",
            borderRadius: i === 0 ? "999px 2px 2px 999px" : i === segs - 1 ? "2px 999px 999px 2px" : 2,
          }} />
        ))}
      </div>
      {sub && <div style={{ fontSize: 11, opacity: .65, marginTop: 4 }}>{sub}</div>}
    </div>
  );
};

/* ── paper card ── */
export const PaperCard = ({ children, color = "#fff", title, accent = "var(--p-500)", titleColor, style = {} }: {
  children: React.ReactNode; color?: string; title?: React.ReactNode;
  accent?: string; titleColor?: string; style?: React.CSSProperties;
}) => (
  <div style={{
    background: color, border: `1.5px solid ${accent}`, borderRadius: 16,
    boxShadow: `0 0 0 3px #fff, 0 0 0 4.5px ${accent}, 0 8px 14px -6px rgba(238,131,177,.4)`,
    overflow: "hidden", ...style,
  }}>
    {title && (
      <div style={{
        background: titleColor || "linear-gradient(90deg, #ffd6e8, #ffb6d0)",
        color: "var(--p-700)", padding: "6px 12px", fontSize: 12, fontWeight: 700,
        borderBottom: `1.5px dashed ${accent}`, textShadow: "1px 1px 0 #fff",
        display: "flex", alignItems: "center", gap: 6,
      }}>{title}</div>
    )}
    <div style={{ padding: 14 }}>{children}</div>
  </div>
);

/* ── sticker badge ── */
export const StickerBadge = ({ children, color = "#ffb6d0", textColor = "#c66293", style = {} }: {
  children: React.ReactNode; color?: string; textColor?: string; style?: React.CSSProperties;
}) => (
  <span style={{
    display: "inline-block", padding: "5px 14px",
    background: `linear-gradient(180deg, #fff, ${color})`,
    color: textColor, fontFamily: "var(--font-cursive)", fontSize: 14,
    border: "1.5px solid #ff9ec5", borderRadius: 999,
    boxShadow: "0 0 0 2.5px #fff, 0 0 0 4px #ff9ec5, 0 3px 0 -1px rgba(238,131,177,.3)",
    textShadow: "1px 1px 0 #fff", letterSpacing: ".5px", ...style,
  }}>{children}</span>
);

/* ── speech bubble ── */
export const Bubble = ({ children, side = "left", color = "#fff", outline = "#ff9ec5", style = {} }: {
  children: React.ReactNode; side?: "left" | "right"; color?: string; outline?: string; style?: React.CSSProperties;
}) => (
  <div style={{
    position: "relative", display: "inline-block",
    padding: "10px 14px", background: color,
    border: `1.5px solid ${outline}`, borderRadius: 16,
    boxShadow: `0 0 0 2.5px #fff, 0 0 0 4px ${outline}, 0 4px 8px -3px rgba(238,131,177,.3)`,
    color: "var(--ink)", fontSize: 13, maxWidth: "92%", ...style,
  }}>
    {children}
    <div style={{
      position: "absolute", [side === "left" ? "left" : "right"]: 18, bottom: -8,
      width: 12, height: 12, background: color,
      border: `1.5px solid ${outline}`, borderTop: "none",
      borderLeft: side === "left" ? `1.5px solid ${outline}` : "none",
      borderRight: side === "right" ? `1.5px solid ${outline}` : "none",
      transform: "rotate(45deg)",
    }} />
  </div>
);
