"use client";
import { useEffect, useState } from "react";
import type { Lang, Question } from "@/content/types";
import { Stage } from "./Stage";
import { UI } from "@/lib/i18n";
import type { useVoice } from "@/lib/voice";

type Voice = ReturnType<typeof useVoice>;

export function Quiz({
  questions, lang, voice, onDone,
}: { questions: Question[]; lang: Lang; voice: Voice; onDone: (score: number) => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = questions[i];

  useEffect(() => {
    void voice.say(q.q[lang]);
    if (questions[i + 1]) voice.preload(questions[i + 1].q[lang]);
    voice.preload(q.explain[lang]);
  }, [q, lang, voice, i, questions]);

  const pick = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (q.options[k].correct) setScore((s) => s + 1);
    void voice.say(q.explain[lang]);
  };

  const next = () => {
    voice.stop();
    if (i + 1 < questions.length) {
      setI(i + 1);
      setPicked(null);
    } else onDone(score);
  };

  const correct = picked !== null && q.options[picked].correct;
  // Hide "scammer" hints in previews: the person must decide on their own.
  const preview = { ...q.scene, danger: false } as typeof q.scene;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-muted">
        <span className="font-bold">{UI.quizTitle[lang]}</span>
        <span>{i + 1} / {questions.length}</span>
      </div>
      <div key={i} className="[--phone-h:min(250px,34vh)]">
        <Stage scene={preview} lang={lang} />
      </div>
      <div className="flex items-start gap-2">
        <h2 className="flex-1 text-xl font-bold leading-snug">{q.q[lang]}</h2>
        <button
          onClick={() => void voice.say(q.q[lang])}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-2xl shadow"
          aria-label={lang === "kk" ? "Сұрақты тыңдау" : "Прослушать вопрос"}
        >
          🔊
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {q.options.map((o, k) => {
          const state =
            picked === null ? "bg-white border-white" :
            o.correct ? "bg-safe/10 border-safe" :
            k === picked ? "bg-danger/10 border-danger" : "bg-white border-white opacity-60";
          return (
            <button
              key={k}
              onClick={() => pick(k)}
              disabled={picked !== null}
              className={`flex min-h-16 items-center gap-4 rounded-2xl border-4 px-4 py-3 text-left text-lg font-bold shadow-sm transition ${state}`}
            >
              <span className="text-3xl">{o.icon}</span>
              <span className="flex-1">{o.text[lang]}</span>
              {picked !== null && o.correct && <span className="text-2xl">✅</span>}
              {picked === k && !o.correct && <span className="text-2xl">❌</span>}
            </button>
          );
        })}
      </div>
      {picked !== null && (
        <div ref={(el) => el?.scrollIntoView({ behavior: "smooth", block: "nearest" })} className={`pop rounded-2xl p-4 ${correct ? "bg-safe text-white" : "bg-danger text-white"}`}>
          <div className="text-xl font-extrabold">{correct ? `👍 ${UI.right[lang]}` : `✋ ${UI.wrong[lang]}`}</div>
          <div className="mt-1">{q.explain[lang]}</div>
          <button onClick={next} className="mt-3 w-full rounded-xl bg-white py-3 text-lg font-bold text-ink">
            {UI.next[lang]}
          </button>
        </div>
      )}
    </div>
  );
}
