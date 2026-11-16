"use client";
import { useCallback, useEffect, useState } from "react";
import { LESSONS } from "@/content";
import { AGES, DISTRICTS } from "@/lib/i18n";

type Row = { key: string; people?: number; certified?: number; done?: number; avg_pct?: number };
type Stats = {
  totals: { people: number; started: number; all_lessons: number; certified: number; avg_lessons: number };
  byDistrict: Row[];
  byAge: Row[];
  byLesson: Row[];
  byDay: Row[];
};

const dName = Object.fromEntries(DISTRICTS.map((d) => [d.id, d.name.ru]));
const aName = Object.fromEntries(AGES.map((a) => [a.id, a.name.ru]));
const lName = Object.fromEntries([...LESSONS.map((l, i) => [l.id, `${i + 1}. ${l.title.ru}`]), ["final", "🎓 Итоговый тест"]]);
const K = "aldanba.admin";

function Bars({ rows, label, value, max }: { rows: Row[]; label: (k: string) => string; value: (r: Row) => number; max?: number }) {
  const m = max ?? Math.max(1, ...rows.map(value));
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.key} className="grid grid-cols-[minmax(0,11rem)_1fr_auto] items-center gap-2 text-sm">
          <span className="truncate">{label(r.key)}</span>
          <span className="h-3 rounded-full bg-sky/10">
            <span className="block h-full rounded-full bg-sky" style={{ width: `${(value(r) / m) * 100}%` }} />
          </span>
          <span className="w-24 text-right tabular-nums">{value(r)}{r.certified !== undefined ? ` · 🎓${r.certified}` : ""}</span>
        </div>
      ))}
      {!rows.length && <p className="text-sm text-muted">Пока нет данных</p>}
    </div>
  );
}

export default function Admin() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [f, setF] = useState({ district: "", age: "", from: "", to: "" });

  const load = useCallback(async (k: string, filters = f) => {
    setError("");
    const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    const res = await fetch(`/api/admin/stats?${qs}`, { headers: { "x-admin-key": k } });
    if (res.status === 401) {
      setAuthed(false);
      sessionStorage.removeItem(K);
      return setError("Неверный пароль");
    }
    if (!res.ok) return setError("Не удалось загрузить отчёт. Обновите страницу.");
    setStats(await res.json());
    setAuthed(true);
    sessionStorage.setItem(K, k);
  }, [f]);

  useEffect(() => {
    const k = sessionStorage.getItem(K);
    if (k) {
      setKey(k);
      void load(k);
    }
    // only on first open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const download = async (type: string) => {
    const res = await fetch(`/api/admin/export?type=${type}`, { headers: { "x-admin-key": key } });
    if (!res.ok) return setError("Не удалось скачать файл");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(await res.blob());
    a.download = `aldanba-${type}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (!authed)
    return (
      <main className="mx-auto w-full max-w-sm flex-1 px-5 py-16">
        <h1 className="mb-4 text-2xl font-extrabold">Алданба! — отчёты</h1>
        <form onSubmit={(e) => { e.preventDefault(); void load(key); }} className="space-y-3">
          <label htmlFor="pw" className="block font-bold">Пароль администратора</label>
          <input id="pw" type="password" value={key} onChange={(e) => setKey(e.target.value)} className="min-h-14 w-full rounded-xl border-2 px-4" autoComplete="current-password" />
          {error && <p className="text-danger">{error}</p>}
          <button className="min-h-14 w-full rounded-xl bg-sky font-bold text-white">Войти</button>
        </form>
      </main>
    );

  const t = stats?.totals;
  const setFilter = (k: keyof typeof f, v: string) => {
    const nf = { ...f, [k]: v };
    setF(nf);
    void load(key, nf);
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 space-y-6 px-4 py-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Алданба! — отчёт</h1>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => download("summary")} className="min-h-11 rounded-xl bg-safe px-4 font-bold text-white">⬇ Сводка (Excel)</button>
          <button onClick={() => download("participants")} className="min-h-11 rounded-xl bg-white px-4 font-bold shadow-sm">⬇ Все участники (Excel)</button>
          <button onClick={() => load(key)} className="min-h-11 rounded-xl bg-white px-4 font-bold shadow-sm">↻ Обновить</button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2 text-sm">
        <select value={f.district} onChange={(e) => setFilter("district", e.target.value)} className="min-h-11 rounded-xl border bg-white px-3" aria-label="Район">
          <option value="">Все районы</option>
          {DISTRICTS.map((d) => <option key={d.id} value={d.id}>{d.name.ru}</option>)}
        </select>
        <select value={f.age} onChange={(e) => setFilter("age", e.target.value)} className="min-h-11 rounded-xl border bg-white px-3" aria-label="Возраст">
          <option value="">Все возрасты</option>
          {AGES.map((a) => <option key={a.id} value={a.id}>{a.name.ru}</option>)}
        </select>
        <label className="flex items-center gap-1">с <input type="date" value={f.from} onChange={(e) => setFilter("from", e.target.value)} className="min-h-11 rounded-xl border bg-white px-2" /></label>
        <label className="flex items-center gap-1">по <input type="date" value={f.to} onChange={(e) => setFilter("to", e.target.value)} className="min-h-11 rounded-xl border bg-white px-2" /></label>
      </div>

      {error && <p className="text-danger">{error}</p>}

      {t && (
        <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {[
            ["Зарегистрировались", t.people],
            ["Начали обучение", t.started],
            ["Прошли все 14 уроков", t.all_lessons],
            ["Получили сертификат", t.certified],
            ["Уроков в среднем", t.avg_lessons],
          ].map(([l, v]) => (
            <div key={l as string} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="text-3xl font-extrabold tabular-nums">{v}</div>
              <div className="text-sm text-muted">{l}</div>
            </div>
          ))}
        </section>
      )}

      {stats && (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-extrabold">По районам (люди · сертификаты)</h2>
            <Bars rows={stats.byDistrict} label={(k) => dName[k] ?? k} value={(r) => r.people ?? 0} />
          </section>
          <section className="rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="mb-3 font-extrabold">По возрасту (люди · сертификаты)</h2>
            <Bars rows={stats.byAge} label={(k) => aName[k] ?? k} value={(r) => r.people ?? 0} />
          </section>
          <section className="rounded-2xl bg-white p-4 shadow-sm md:col-span-2">
            <h2 className="mb-3 font-extrabold">Уроки: сколько прошли · средний балл теста</h2>
            <div className="space-y-1.5">
              {stats.byLesson.map((r) => (
                <div key={r.key} className="grid grid-cols-[minmax(0,1fr)_5rem_5rem] gap-2 text-sm">
                  <span className="truncate">{lName[r.key] ?? r.key}</span>
                  <span className="text-right tabular-nums">{r.done}</span>
                  <span className="text-right tabular-nums">{r.avg_pct}%</span>
                </div>
              ))}
              {!stats.byLesson.length && <p className="text-sm text-muted">Пока нет данных</p>}
            </div>
          </section>
          <section className="rounded-2xl bg-white p-4 shadow-sm md:col-span-2">
            <h2 className="mb-3 font-extrabold">Регистрации по дням</h2>
            <Bars rows={stats.byDay} label={(k) => k} value={(r) => r.people ?? 0} />
          </section>
        </div>
      )}
    </main>
  );
}
