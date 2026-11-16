import { db } from "@/lib/db";
import { deny, isAdmin } from "@/lib/admin";
import { FINAL_PASS } from "@/content";

// Optional filters: ?district=taraz&age=60%2B&from=2026-11-18&to=2026-11-30
export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  const u = new URL(req.url);
  const district = u.searchParams.get("district") || null;
  const age = u.searchParams.get("age") || null;
  const from = u.searchParams.get("from") || null;
  const to = u.searchParams.get("to") || null;
  const sql = db();

  // Filtered participant set, reused by every query.
  const f = sql`select id, district, age_group, created_at from participants
    where (${district}::text is null or district = ${district})
      and (${age}::text is null or age_group = ${age})
      and (${from}::date is null or created_at >= ${from}::date)
      and (${to}::date is null or created_at < ${to}::date + 1)`;

  const [totals, byDistrict, byAge, byLesson, byDay] = await sql.transaction((tx) => [
    tx`with f as (${f}), done as (
         select participant_id, count(*) filter (where lesson_id <> 'final') as lessons,
                max(score) filter (where lesson_id = 'final') as final
         from progress where participant_id in (select id from f) group by participant_id)
       select (select count(*) from f)::int as people,
              (select count(*) from done where lessons > 0)::int as started,
              (select count(*) from done where lessons >= 14)::int as all_lessons,
              (select count(*) from done where final >= ${FINAL_PASS})::int as certified,
              (select coalesce(round(avg(lessons), 1), 0) from done)::float as avg_lessons`,
    tx`with f as (${f}) select f.district as key, count(distinct f.id)::int as people,
         count(distinct p.participant_id) filter (where p.lesson_id = 'final' and p.score >= ${FINAL_PASS})::int as certified
       from f left join progress p on p.participant_id = f.id group by f.district order by people desc`,
    tx`with f as (${f}) select f.age_group as key, count(distinct f.id)::int as people,
         count(distinct p.participant_id) filter (where p.lesson_id = 'final' and p.score >= ${FINAL_PASS})::int as certified
       from f left join progress p on p.participant_id = f.id group by f.age_group order by key`,
    tx`with f as (${f}) select lesson_id as key, count(*)::int as done,
         round(100.0 * avg(score::float / total))::int as avg_pct
       from progress where participant_id in (select id from f) group by lesson_id order by lesson_id`,
    tx`with f as (${f}) select to_char(created_at at time zone 'Asia/Almaty', 'YYYY-MM-DD') as key, count(*)::int as people
       from f group by 1 order by 1`,
  ], { readOnly: true });

  return Response.json({ totals: (totals as Record<string, unknown>[])[0], byDistrict, byAge, byLesson, byDay });
}
