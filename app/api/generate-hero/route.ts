import { NextResponse } from "next/server";

const APP_CONCEPT = `
커플이 각자 쓴 일기를 AI가 분석해서 둘 사이의 갈등 패턴과 속마음을 게임 퀘스트로 풀어주는 앱.
레퍼런스 스타일: 카와이 Y2K 핑크 콜라주, 스티커 스크랩북, 귀여운 캐릭터, 한국어/일본어 텍스트 믹스,
소프트 핑크 파스텔, 하트/별/반짝이 장식, 다이어리/편지 요소.
`;

async function generatePromptWithGemini(apiKey: string): Promise<string> {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert at writing image generation prompts.
Create a detailed English prompt for a hero image for this app: ${APP_CONCEPT}

Style requirements:
- Kawaii Y2K aesthetic, soft pink and white palette
- Scrapbook collage layout with stickers and cute elements
- Two pixel-art style characters (couple) writing in diaries on opposite sides
- A glowing pink AI orb in the center transforming diary text into quest scrolls
- Cute animal stickers (seals, bunnies, bears), hearts, stars, sparkles
- Korean/Japanese decorative text elements mixed in
- Pink speech bubbles and UI elements like loading bars and chat windows
- Dreamy, soft, romantic but playful game-quest vibe

Write ONLY the image prompt, no explanation. Max 200 words.`
          }]
        }]
      }),
    }
  );

  if (!response.ok) throw new Error("Gemini API 실패");

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export async function POST() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY가 없습니다." }, { status: 500 });
  }

  let prompt: string;
  try {
    prompt = await generatePromptWithGemini(apiKey);
  } catch {
    // Gemini 실패 시 기본 프롬프트 사용
    prompt = `Kawaii Y2K scrapbook collage hero image, soft pink and white palette. Two cute pixel art characters sitting apart writing in pastel diaries, glowing pink AI crystal orb floats between them with sparkles, transforming handwritten diary entries into glowing quest scroll. Surrounded by kawaii stickers: baby seals, bunnies, pink bears, hearts, stars. Korean and Japanese decorative text elements, pink speech bubbles, cute loading bar UI, letter envelopes, pink checkered patterns. Dreamy romantic atmosphere, soft watercolor background with halftone dots, scrapbook layout, high detail illustration.`;
  }

  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1920&height=1080&nologo=true&seed=${Math.floor(Math.random() * 99999)}`;

  const response = await fetch(url);
  if (!response.ok) {
    return NextResponse.json({ error: "이미지 생성 실패" }, { status: 500 });
  }

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  return NextResponse.json({
    image: `data:image/jpeg;base64,${base64}`,
    prompt,
  });
}
