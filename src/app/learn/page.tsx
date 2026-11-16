"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lang } from "@/content/types";
import { FINAL_ID, FINAL_PASS, LESSONS } from "@/content";
import { LEVELS } from "@/content/levels";
import { Owl, Ornament } from "@/components/Brand";
import { UI } from "@/lib/i18n";
import { flush, getProfile, getProgress, setLang as storeLang, type Profile, type Result } from "@/lib/store";

export default function Learn() {
  const router = useRouter();
  const [p, setP] = useState<Profile | null>(null);
  const [prog, setProg] = useState<Record<string, Result>>({});

  useEffect(() => {
    const profile = getProfile();
    if (!profile) return router.replace("/");
    setP(profile);
    setProg(getProgress());
    void flush();
  }, [router]);

  if (!p) return null;
  const lang = p.lang;
  const doneCount = LESSONS.filter((l) => prog[l.id]).length;
  const firstOpen = LESSONS.findIndex((l) => !prog[l.id]);
  const final = prog[FINAL_ID];
  const allDone = doneCount === LESSONS.length;

  const switchLang = (l: Lang) => {
    storeLang(l);
    setP({ ...p, lang: l });
  };

  return (
    <main className="mx-auto w-full max-w-[480px] flex-1 pb-10">
      <section className="relative bg-sky px-5 pb-8 pt-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-2xl font-extrabold">
            <Owl size={44} /> Алданба!
          </div>
          <div className="flex rounded-full bg-white/15 p-1 text-sm font-bold">
            {(["kk", "ru"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => switchLang(l)}
                className={`min-h-10 rounded-full px-3 ${lang === l ? "bg-white text-sky" : ""}`}
                aria-pressed={lang === l}
              >
                {l === "kk" ? "ҚАЗ" : "РУС"}
              </button>
            ))}
          </div>
        </div>
        <h1 className="mt-5 text-3xl font-extrabold">
          {lang === "kk" ? `Сәлем, ${p.name}!` : `Привет, ${p.name}!`}
        </h1>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(doneCount / LESSONS.length) * 100}%` }} />
          </div>
          <span className="font-bold">{doneCount}/{LESSONS.length}</span>
        </div>
        <Ornament className="absolute bottom-0 left-0" />
      </section>

      <div className="space-y-7 px-4 pt-6">
        {LEVELS.map((lv) => (
          <section key={lv.id}>
            <h2 className="mb-3 flex items-center gap-2 text-xl font-extrabold" style={{ color: lv.color }}>
              <span className="grid h-10 w-10 place-items-center rounded-full text-xl text-white" style={{ background: lv.color }}>
                {lv.id}
              </span>
              {lv.title[lang]}
            </h2>
            <ol className="space-y-2.5">
              {LESSONS.filter((l) => l.level === lv.id).map((l) => {
                const i = LESSONS.indexOf(l);
                const r = prog[l.id];
                const open = r || i === firstOpen;
                const body = (
                  <>
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-3xl" style={{ background: `${lv.color}1a` }}>
                      {open ? l.icon : "🔒"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-bold leading-snug">{l.title[lang]}</span>
                      {r && <span className="text-sm text-muted">{"⭐".repeat(r.score)}{"☆".repeat(r.total - r.score)}</span>}
                    </span>
                    {r ? <span className="text-2xl">✅</span> : open && <span className="rounded-full bg-gold px-3 py-2 font-bold">▶</span>}
                  </>
                );
                return (
                  <li key={l.id}>
                    {open ? (
                      <Link
                        href={`/lesson/${l.id}`}
                        className={`flex min-h-20 items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ${i === firstOpen ? "ring-4 ring-gold" : ""}`}
                      >
                        {body}
                      </Link>
                    ) : (
                      <div className="flex min-h-20 items-center gap-3 rounded-2xl bg-white/60 p-3 text-muted" aria-disabled title={UI.locked[lang]}>
                        {body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}

        <section>
          {allDone ? (
            <Link href={final && final.score >= FINAL_PASS ? "/certificate" : "/final"} className="flex min-h-24 items-center gap-4 rounded-2xl bg-gold p-4 shadow">
              <span className="text-5xl">🎓</span>
              <span className="flex-1 text-xl font-extrabold">
                {final && final.score >= FINAL_PASS ? UI.certificate[lang] : UI.final[lang]}
              </span>
            </Link>
          ) : (
            <div className="flex min-h-24 items-center gap-4 rounded-2xl bg-white/60 p-4 text-muted">
              <span className="text-5xl grayscale">🎓</span>
              <span>
                <span className="block text-xl font-extrabold">{UI.final[lang]}</span>
                {UI.finalLocked[lang]}
              </span>
            </div>
          )}
        </section>

        <section className="rounded-2xl border-l-8 border-danger bg-white p-4">
          <h2 className="text-lg font-extrabold">🆘 {UI.help[lang]}</h2>
          <p className="mt-1">{UI.helpText[lang]}</p>
          <a href="tel:102" className="mt-3 inline-flex min-h-12 items-center rounded-xl bg-danger px-5 font-bold text-white">📞 102</a>
        </section>

        <p className="text-center text-sm">
          <Link href="/privacy" className="text-muted underline">{UI.privacy[lang]}</Link>
        </p>
      </div>
    </main>
  );
}
