"use client";

import { useState } from "react";

export default function GenerateHeroPage() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setImage(null);
    setPrompt(null);

    const res = await fetch("/api/generate-hero", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setError(JSON.stringify(data.error, null, 2));
    } else {
      setImage(data.image);
      setPrompt(data.prompt);
    }

    setLoading(false);
  }

  function download() {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image;
    a.download = "hero.png";
    a.click();
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-white text-2xl font-bold tracking-widest">Hero Image Generator</h1>

      <button
        onClick={generate}
        disabled={loading}
        className="px-8 py-3 bg-pink-500 text-black font-bold text-lg hover:bg-pink-400 disabled:opacity-50 transition-colors"
      >
        {loading ? "생성 중..." : "이미지 생성"}
      </button>

      {error && (
        <pre className="text-red-400 text-sm bg-gray-900 p-4 rounded max-w-xl overflow-auto">
          {error}
        </pre>
      )}

      {image && (
        <div className="flex flex-col items-center gap-4 max-w-4xl w-full">
          <img src={image} alt="hero" className="w-full border-2 border-pink-500" />
          <button
            onClick={download}
            className="px-6 py-2 border-2 border-pink-500 text-pink-500 font-bold hover:bg-pink-500 hover:text-black transition-colors"
          >
            PNG 다운로드
          </button>
          {prompt && (
            <details className="w-full">
              <summary className="text-pink-400 text-sm cursor-pointer">Gemini가 생성한 프롬프트 보기</summary>
              <p className="text-gray-400 text-xs mt-2 bg-gray-900 p-3 rounded whitespace-pre-wrap">{prompt}</p>
            </details>
          )}
        </div>
      )}
    </main>
  );
}
