"use client";
import type { Lang } from "@/content/types";

export type Profile = { id: string; name: string; lang: Lang; age: string; district: string };
export type Result = { score: number; total: number };
type Progress = Record<string, Result>;
type Pending = { lesson?: string; score?: number; total?: number }[];

const P = "aldanba.profile";
const R = "aldanba.progress";
const Q = "aldanba.pending";

function read<T>(k: string, fallback: T): T {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(k: string, v: unknown) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    /* storage blocked: app still works for this visit */
  }
}

export const getProfile = () => read<Profile | null>(P, null);
export const getProgress = () => read<Progress>(R, {});

export function uuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (+c ^ (Math.random() * 16) >> (+c / 4)).toString(16),
  );
}

export function saveProfile(p: Profile) {
  write(P, p);
  queue({});
}

export function setLang(lang: Lang) {
  const p = getProfile();
  if (p) write(P, { ...p, lang });
}

export function saveResult(lesson: string, score: number, total: number) {
  const prog = getProgress();
  const prev = prog[lesson];
  if (!prev || score >= prev.score) prog[lesson] = { score, total };
  write(R, prog);
  queue({ lesson, score, total });
}

function queue(item: Pending[number]) {
  write(Q, [...read<Pending>(Q, []), item]);
  void flush();
}

let flushing = false;
/** Sends queued events; anything that fails stays queued for the next visit. */
export async function flush() {
  const p = getProfile();
  if (!p || flushing) return;
  flushing = true;
  try {
    let items = read<Pending>(Q, []);
    while (items.length) {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // name is intentionally NOT sent (personal data stays on the device)
        body: JSON.stringify({ id: p.id, lang: p.lang, age: p.age, district: p.district, ...items[0] }),
        keepalive: true,
      });
      if (!res.ok && res.status !== 400) break;
      items = read<Pending>(Q, []).slice(1);
      write(Q, items);
    }
  } catch {
    /* offline: retry later */
  } finally {
    flushing = false;
  }
}
