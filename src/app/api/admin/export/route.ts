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

export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  const type = new URL(req.url).searchParams.get("type") || "summary";
  const sql = db();
  let body: string;

  if (type === "participants") {
    // Anonymous rows: random device id, no names or contacts exist in the database.
    const rows = (await sql`select p.id, p.district, p.age_group, p.lang,
        to_char(p.created_at at time zone 'Asia/Almaty', 'YYYY-MM-DD HH24:MI') as created,
        count(g.lesson_id) filter (where g.lesson_id <> 'final')::int as lessons,
        max(g.score) filter (where g.lesson_id = 'final') as final
      from participants p left join progress g on g.participant_id = p.id
      group by p.id order by p.created_at`) as Record<string, unknown>[];
    body = csv([
      ["ID (анонимный)", "Район", "Возраст", "Язык", "Дата регистрации", "Уроков пройдено", "Итоговый тест", "Сертификат"],
      ...rows.map((r) => [
        r.id, dName[r.district as string] ?? r.district, aName[r.age_group as string] ?? r.age_group,
        r.lang === "kk" ? "қазақша" : "русский", r.created, r.lessons,
        r.final == null ? "" : `${r.final}/14`, r.final != null && (r.final as number) >= FINAL_PASS ? "да" : "нет",
      ]),
    ]);
  } else {
    const rows = (await sql`select p.district, p.age_group, count(distinct p.id)::int as people,
        count(distinct g.participant_id) filter (where g.lesson_id <> 'final')::int as started,
        count(distinct g.participant_id) filter (where g.lesson_id = 'final' and g.score >= ${FINAL_PASS})::int as certified
      from participants p left join progress g on g.participant_id = p.id
      group by 1, 2 order by 1, 2`) as Record<string, unknown>[];
    const lessons = (await sql`select lesson_id, count(*)::int as done,
        round(100.0 * avg(score::float / total))::int as avg_pct from progress group by 1`) as Record<string, unknown>[];
    const byLesson = Object.fromEntries(lessons.map((l) => [l.lesson_id, l]));
    body = csv([
      ["Сводка по районам и возрастам"],
      ["Район", "Возраст", "Зарегистрировались", "Начали обучение", "Получили сертификат"],
      ...rows.map((r) => [dName[r.district as string] ?? r.district, aName[r.age_group as string] ?? r.age_group, r.people, r.started, r.certified]),
      [],
      ["Уроки"],
      ["№", "Урок", "Прошли", "Средний результат теста, %"],
      ...LESSONS.map((l, i) => [i + 1, l.title.ru, (byLesson[l.id]?.done as number) ?? 0, byLesson[l.id]?.avg_pct ?? ""]),
      ["", "Итоговый тест", (byLesson.final?.done as number) ?? 0, byLesson.final?.avg_pct ?? ""],
    ]);
  }

  const date = new Date().toISOString().slice(0, 10);
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="aldanba-${type}-${date}.csv"`,
      "cache-control": "no-store",
    },
  });
}
