"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FINAL_ID, FINAL_PASS, LESSONS } from "@/content";
import { UI } from "@/lib/i18n";
import { getProfile, getProgress, type Profile } from "@/lib/store";

const W = 1200;
const H = 850;

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, max: number, lh: number) {
  let line = "";
  for (const w of text.split(" ")) {
    if (ctx.measureText(line + w).width > max && line) {
      ctx.fillText(line.trim(), x, y);
      line = "";
      y += lh;
    }
    line += w + " ";
  }
  ctx.fillText(line.trim(), x, y);
}

export default function Certificate() {
  const router = useRouter();
  const canvas = useRef<HTMLCanvasElement>(null);
  const [p, setP] = useState<Profile | null>(null);
  const [url, setUrl] = useState("");

  useEffect(() => {
    const profile = getProfile();
    const r = getProgress()[FINAL_ID];
    if (!profile || !r || r.score < FINAL_PASS) return router.replace("/learn");
    setP(profile);
  }, [router]);

  useEffect(() => {
    const c = canvas.current;
    if (!p || !c) return;
    const lang = p.lang;
    const ctx = c.getContext("2d")!;
    const draw = () => {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#0e5fa8";
      ctx.lineWidth = 18;
      ctx.strokeRect(24, 24, W - 48, H - 48);
      ctx.strokeStyle = "#f2b705";
      ctx.lineWidth = 4;
      ctx.strokeRect(52, 52, W - 104, H - 104);
      ctx.textAlign = "center";
      ctx.fillStyle = "#0e5fa8";
      ctx.font = "800 64px Rubik, sans-serif";
      ctx.fillText("Алданба!", W / 2, 170);
      ctx.fillStyle = "#14263b";
      ctx.font = "700 34px Rubik, sans-serif";
      ctx.fillText(UI.certTitle[lang], W / 2, 240);
      ctx.font = "800 84px Rubik, sans-serif";
      ctx.fillText(p.name, W / 2, 400);
      ctx.fillStyle = "#f2b705";
      ctx.fillRect(W / 2 - 220, 430, 440, 6);
      ctx.fillStyle = "#14263b";
      ctx.font = "400 34px Rubik, sans-serif";
      wrap(ctx, UI.certText[lang], W / 2, 510, 860, 48);
      ctx.font = "800 120px sans-serif";
      ctx.fillText("🦉", W / 2, 720);
      ctx.fillStyle = "#5b6b7d";
      ctx.font = "400 26px Rubik, sans-serif";
      ctx.fillText(new Date().toLocaleDateString(lang === "kk" ? "kk-KZ" : "ru-RU"), W / 2, 770);
      setUrl(c.toDataURL("image/png"));
    };
    void document.fonts.ready.then(draw);
  }, [p]);

  if (!p) return null;
  const lang = p.lang;
  const site = typeof location !== "undefined" ? location.origin : "";

  const share = async () => {
    const text = `${UI.shareText[lang]} ${site}`;
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], "aldanba.png", { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file], text });
      if (navigator.share) return await navigator.share({ text, url: site });
    } catch {
      return; // user closed the share sheet
    }
    await navigator.clipboard?.writeText(text);
    alert(lang === "kk" ? "Сілтеме көшірілді" : "Ссылка скопирована");
  };

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-4 px-4 py-6">
      <h1 className="text-center text-2xl font-extrabold">🎓 {UI.certificate[lang]}</h1>
      <canvas ref={canvas} width={W} height={H} className="w-full rounded-xl shadow-lg" aria-label={`${UI.certificate[lang]}: ${p.name}`} />
      <a href={url} download="aldanba-certificate.png" className="rounded-2xl bg-gold py-4 text-center text-xl font-extrabold shadow">
        ⬇️ {UI.download[lang]}
      </a>
      <button onClick={share} className="rounded-2xl bg-white py-4 text-lg font-bold shadow-sm">📤 {UI.share[lang]}</button>
      <Link href="/learn" className="py-2 text-center font-bold text-sky">{UI.toMap[lang]}</Link>
      <p className="text-center text-sm text-muted">{LESSONS.length} / {LESSONS.length} ✅</p>
    </main>
  );
}
