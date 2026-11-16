import { db } from "@/lib/db";
import { deny, isAdmin } from "@/lib/admin";
import { AGES, DISTRICTS } from "@/lib/i18n";
import { FINAL_PASS, LESSONS } from "@/content";

const dName = Object.fromEntries(DISTRICTS.map((d) => [d.id, d.name.ru]));
const aName = Object.fromEntries(AGES.map((a) => [a.id, a.name.ru]));
const cell = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
// Excel (RU locale) opens ";"-separated UTF-8 with BOM correctly.
const csv = (rows: unknown[][]) => "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");

// Aggregated only: per-person rows are anonymous anyway and would exceed the function response limit at scale.
export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  const sql = db();
  const rows = (await sql`with per as (
      select participant_id,
        count(*) filter (where lesson_id <> 'final') as lessons,
        max(score) filter (where lesson_id = 'final') as final
      from progress group by participant_id)
    select p.district, p.age_group, count(*)::int as people,
      count(per.participant_id) filter (where per.lessons > 0)::int as started,
      count(per.participant_id) filter (where per.lessons >= ${LESSONS.length})::int as all_lessons,
      count(per.participant_id) filter (where per.lessons >= ${LESSONS.length} and per.final >= ${FINAL_PASS})::int as certified
    from participants p left join per on per.participant_id = p.id
    group by 1, 2 order by 1, 2`) as Record<string, unknown>[];
  const lessons = (await sql`select lesson_id, count(*)::int as done,
      round(100.0 * avg(score::float / total))::int as avg_pct from progress group by 1`) as Record<string, unknown>[];
  const byLesson = Object.fromEntries(lessons.map((l) => [l.lesson_id, l]));

  const body = csv([
    ["Сводка по районам и возрастам"],
    ["Район", "Возраст", "Зарегистрировались", "Начали обучение", "Прошли все уроки", "Получили сертификат"],
    ...rows.map((r) => [dName[r.district as string] ?? r.district, aName[r.age_group as string] ?? r.age_group, r.people, r.started, r.all_lessons, r.certified]),
    [],
    ["Уроки"],
    ["№", "Урок", "Прошли", "Средний результат теста, %"],
    ...LESSONS.map((l, i) => [i + 1, l.title.ru, (byLesson[l.id]?.done as number) ?? 0, byLesson[l.id]?.avg_pct ?? ""]),
    ["", "Итоговый тест", (byLesson.final?.done as number) ?? 0, byLesson.final?.avg_pct ?? ""],
  ]);

  const date = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="aldanba-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
