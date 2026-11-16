"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Lang } from "@/content/types";
import { Owl, Ornament } from "@/components/Brand";
import { AGES, DISTRICTS, UI } from "@/lib/i18n";
import { getProfile, saveProfile, uuid } from "@/lib/store";

type Step = "lang" | "name" | "age" | "district";

export default function Onboarding() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<Step>("lang");
  const [lang, setLang] = useState<Lang>("kk");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    if (getProfile()) router.replace("/learn");
    else setReady(true);
  }, [router]);

  if (!ready) return null;

  const finish = (district: string) => {
    saveProfile({ id: uuid(), name: name.trim().slice(0, 40), lang, age, district });
    router.push("/learn");
  };

  const steps: Step[] = ["lang", "name", "age", "district"];
  const n = steps.indexOf(step);

  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col">
      {n === 0 ? (
        <section className="relative bg-sky px-6 pb-8 pt-10 text-center text-white">
          <Owl size={104} className="pop mx-auto" />
          <h1 className="mt-2 text-5xl font-extrabold tracking-tight">Алданба!</h1>
          <p className="mt-1 text-lg text-white/85">{UI.tagline[lang]}</p>
          <Ornament className="absolute bottom-0 left-0" />
        </section>
      ) : (
        <section className="relative flex items-center gap-2 bg-sky px-5 pb-6 pt-4 text-2xl font-extrabold text-white">
          <Owl size={44} /> Алданба!
          <Ornament className="absolute bottom-0 left-0" />
        </section>
      )}

      {n > 0 && (
        <div className="flex gap-1.5 px-6 pt-5" aria-hidden>
          {steps.slice(1).map((s, i) => (
            <span key={s} className={`h-2 flex-1 rounded-full ${i < n ? "bg-sky" : "bg-sky/20"}`} />
          ))}
        </div>
      )}

      <div key={step} className="pop flex flex-1 flex-col gap-4 px-6 py-6">
        {step === "lang" && (
          <>
            {(["kk", "ru"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => {
                  setLang(l);
                  setStep("name");
                }}
                className="flex min-h-20 items-center justify-center rounded-2xl bg-white text-2xl font-extrabold shadow-sm ring-sky active:ring-4"
              >
                {l === "kk" ? "Қазақша" : "Русский"}
              </button>
            ))}
            <p className="mt-auto text-center text-sm text-muted">
              {UI.privacyShort.kk}
              <br />
              {UI.privacyShort.ru}
              <br />
              <Link href="/privacy" className="underline">{UI.privacy.kk} / {UI.privacy.ru}</Link>
            </p>
          </>
        )}

        {step === "name" && (
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (name.trim()) setStep("age");
            }}
          >
            <label htmlFor="name" className="text-2xl font-extrabold">{UI.yourName[lang]}</label>
            <input
              id="name"
              autoFocus
              autoComplete="given-name"
              maxLength={40}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={UI.namePh[lang]}
              className="min-h-16 rounded-2xl border-4 border-white bg-white px-5 text-2xl shadow-sm outline-none focus:border-sky"
            />
            <p className="text-muted">🔒 {UI.nameNote[lang]}</p>
            <button disabled={!name.trim()} className="min-h-16 rounded-2xl bg-gold text-xl font-extrabold shadow disabled:opacity-40">
              {UI.next[lang]}
            </button>
          </form>
        )}

        {step === "age" && (
          <>
            <h2 className="text-2xl font-extrabold">{UI.yourAge[lang]}</h2>
            <div className="grid grid-cols-2 gap-3">
              {AGES.map((a) => (
                <button
                  key={a.id}
                  onClick={() => {
                    setAge(a.id);
                    setStep("district");
                  }}
                  className="flex min-h-20 flex-col items-center justify-center rounded-2xl bg-white text-lg font-bold shadow-sm"
                >
                  <span className="text-3xl">{a.icon}</span>
                  {a.name[lang]}
                </button>
              ))}
            </div>
          </>
        )}

        {step === "district" && (
          <>
            <h2 className="text-2xl font-extrabold">{UI.yourDistrict[lang]}</h2>
            <div className="flex flex-col gap-2">
              {DISTRICTS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => finish(d.id)}
                  className="min-h-14 rounded-2xl bg-white px-5 text-left text-lg font-bold shadow-sm"
                >
                  📍 {d.name[lang]}
                </button>
              ))}
            </div>
          </>
        )}

        {n > 0 && (
          <button onClick={() => setStep(steps[n - 1])} className="py-2 font-bold text-sky">
            ← {lang === "kk" ? "Артқа" : "Назад"}
          </button>
        )}
      </div>
    </main>
  );
}
