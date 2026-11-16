"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FINAL_ID, FINAL_PASS, LESSONS } from "@/content";
import { Quiz } from "@/components/Quiz";
import { Owl } from "@/components/Brand";
import { UI } from "@/lib/i18n";
import { useVoice } from "@/lib/voice";
import { getProfile, getProgress, saveResult, type Profile } from "@/lib/store";

const QUESTIONS = LESSONS.map((l) => l.final);

export default function Final() {
  const router = useRouter();
  const [p, setP] = useState<Profile | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [round, setRound] = useState(0);
  const voice = useVoice(p?.lang ?? "kk");

  useEffect(() => {
    const profile = getProfile();
    const prog = getProgress();
    if (!profile || LESSONS.some((l) => !prog[l.id])) return router.replace("/learn");
    setP(profile);
  }, [router]);

  if (!p) return null;
  const lang = p.lang;

  if (score === null)
    return (
      <main className="mx-auto w-full max-w-[480px] flex-1 px-4 py-4">
        <header className="mb-3 flex items-center gap-3">
          <Link href="/learn" onClick={() => voice.stop()} className="grid h-12 w-12 place-items-center rounded-full bg-white text-2xl shadow" aria-label={UI.toMap[lang]}>←</Link>
          <h1 className="text-xl font-extrabold">🎓 {UI.final[lang]}</h1>
        </header>
        <Quiz
          key={round}
          questions={QUESTIONS}
          lang={lang}
          voice={voice}
          onDone={(s) => {
            saveResult(FINAL_ID, s, QUESTIONS.length);
            setScore(s);
          }}
        />
      </main>
    );

  const pass = score >= FINAL_PASS;
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
      <Owl size={130} className="pop" />
      <div className="text-6xl font-extrabold">{score}/{QUESTIONS.length}</div>
      <h1 className="text-2xl font-extrabold">{pass ? UI.finalPass[lang] : UI.finalFail[lang]}</h1>
      {pass ? (
        <Link href="/certificate" className="w-full rounded-2xl bg-gold py-4 text-xl font-extrabold shadow">🎓 {UI.certificate[lang]}</Link>
      ) : (
        <button onClick={() => { setScore(null); setRound((r) => r + 1); }} className="w-full rounded-2xl bg-gold py-4 text-xl font-extrabold shadow">
          ↻ {UI.retry[lang]}
        </button>
      )}
      <Link href="/learn" className="py-2 font-bold text-sky">{UI.toMap[lang]}</Link>
    </main>
  );
}
