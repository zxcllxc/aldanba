"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lang, Lesson } from "@/content/types";
import { LESSONS } from "@/content";
import { LEVELS } from "@/content/levels";
import { Stage } from "./Stage";
import { Quiz } from "./Quiz";
import { Owl } from "./Brand";
import { UI } from "@/lib/i18n";
import { useVoice } from "@/lib/voice";
import { getProfile, getProgress, saveResult } from "@/lib/store";

type Phase = "intro" | "watch" | "quiz" | "result";

export function LessonView({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [subs, setSubs] = useState(true);
  const [score, setScore] = useState(0);
  const voice = useVoice(lang ?? "kk");

  const pos = LESSONS.findIndex((l) => l.id === lesson.id);
  const next = LESSONS[pos + 1];
  const level = LEVELS.find((l) => l.id === lesson.level)!;

  useEffect(() => {
    const p = getProfile();
    if (!p) return router.replace("/");
    const prev = LESSONS[pos - 1];
    if (prev && !getProgress()[prev.id]) return router.replace("/");
    setLang(p.lang);
  }, [router, pos]);

  // Narration drives the slideshow: when a line ends, show the next scene.
  useEffect(() => {
    if (phase !== "watch" || paused || !lang) return;
    const beat = lesson.beats[idx];
    const after = lesson.beats[idx + 1];
    if (after) voice.preload(after.say[lang], after.voice);
    let t: ReturnType<typeof setTimeout>;
    void voice.say(beat.say[lang], beat.voice).then((finished) => {
      if (!finished) return;
      t = setTimeout(() => {
        if (idx + 1 < lesson.beats.length) setIdx(idx + 1);
        else setPhase("quiz");
      }, 700);
    });
    return () => clearTimeout(t);
  }, [phase, paused, idx, lang, lesson, voice]);

  if (!lang) return null;

  const go = (d: number) => {
    voice.stop();
    setPaused(false);
    setIdx((i) => Math.min(Math.max(i + d, 0), lesson.beats.length - 1));
  };

  const finishQuiz = (s: number) => {
    setScore(s);
    saveResult(lesson.id, s, lesson.quiz.length);
    setPhase("result");
  };

  const header = (
    <header className="flex items-center gap-3 px-4 pt-4">
      <Link href="/learn" onClick={() => voice.stop()} className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow" aria-label={UI.toMap[lang]}>
        ←
      </Link>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold" style={{ color: level.color }}>
          {level.icon} {level.id}-{UI.level[lang]}
        </div>
        <h1 className="truncate text-lg font-extrabold">{lesson.title[lang]}</h1>
      </div>
    </header>
  );

  if (phase === "intro")
    return (
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        {header}
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="text-[110px] leading-none">{lesson.icon}</div>
          <h2 className="text-3xl font-extrabold">{lesson.title[lang]}</h2>
          <button
            onClick={() => setPhase("watch")}
            className="flex h-24 w-24 items-center justify-center rounded-full bg-gold text-5xl shadow-lg"
            aria-label={UI.play[lang]}
          >
            ▶
          </button>
          <div className="text-muted">🔊 {lang === "kk" ? "Дыбысты қосыңыз" : "Включите звук"}</div>
        </div>
      </main>
    );

  if (phase === "watch") {
    const beat = lesson.beats[idx];
    return (
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        {header}
        <div className="flex gap-1 px-4 pt-3" aria-hidden>
          {lesson.beats.map((_, i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-sky" : "bg-sky/20"}`} />
          ))}
        </div>
        <div className="flex flex-1 flex-col justify-center px-4 py-4" onClick={() => setPaused((p) => !p)}>
          <div key={idx}>
            <Stage scene={beat.scene} lang={lang} />
          </div>
        </div>
        {subs && (
          <p className="mx-4 mb-3 min-h-[3.5em] rounded-2xl bg-white/80 px-4 py-3 text-center text-[17px] leading-snug" aria-live="polite">
            {beat.voice === "s" && "🕵️ "}
            {beat.say[lang]}
          </p>
        )}
        <nav className="flex items-center justify-center gap-4 px-4 pb-6">
          <button onClick={() => setSubs((s) => !s)} className={`h-12 rounded-full px-3 text-sm font-bold shadow ${subs ? "bg-ink text-white" : "bg-white"}`} aria-pressed={subs}>
            CC
          </button>
          <button onClick={() => go(-1)} className="grid h-14 w-14 place-items-center rounded-full bg-white text-2xl shadow" aria-label="Back">⏮</button>
          <button
            onClick={() => {
              if (!paused) voice.stop();
              setPaused(!paused);
            }}
            className="grid h-[72px] w-[72px] place-items-center rounded-full bg-sky text-3xl text-white shadow-lg"
            aria-label={paused ? "Play" : "Pause"}
          >
            {paused ? "▶" : "❚❚"}
          </button>
          <button
            onClick={() => (idx + 1 < lesson.beats.length ? go(1) : (voice.stop(), setPhase("quiz")))}
            className="grid h-14 w-14 place-items-center rounded-full bg-white text-2xl shadow"
            aria-label="Next"
          >
            ⏭
          </button>
          <span className="w-12" />
        </nav>
      </main>
    );
  }

  if (phase === "quiz")
    return (
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
        {header}
        <div className="px-4 py-4">
          <Quiz questions={lesson.quiz} lang={lang} voice={voice} onDone={finishQuiz} />
        </div>
      </main>
    );

  const total = lesson.quiz.length;
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
      {header}
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <Owl size={120} className="pop" />
        <h2 className="text-3xl font-extrabold">{UI.done[lang]}</h2>
        <div className="text-5xl tracking-widest" aria-label={`${score}/${total}`}>
          {Array.from({ length: total }, (_, i) => (i < score ? "⭐" : "☆")).join("")}
        </div>
        <div className="w-full space-y-3">
          {next ? (
            <Link href={`/lesson/${next.id}`} className="block rounded-2xl bg-gold py-4 text-xl font-extrabold shadow">
              {next.icon} {UI.nextLesson[lang]}
            </Link>
          ) : (
            <Link href="/final" className="block rounded-2xl bg-gold py-4 text-xl font-extrabold shadow">
              🎓 {UI.final[lang]}
            </Link>
          )}
          <button
            onClick={() => {
              setIdx(0);
              setPhase("watch");
            }}
            className="block w-full rounded-2xl bg-white py-4 text-lg font-bold shadow-sm"
          >
            ↻ {UI.again[lang]}
          </button>
          <Link href="/learn" className="block py-2 font-bold text-sky">{UI.toMap[lang]}</Link>
        </div>
      </div>
    </main>
  );
}
