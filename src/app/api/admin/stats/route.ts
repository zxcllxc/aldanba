import { db } from "@/lib/db";
import { deny, isAdmin } from "@/lib/admin";
import { FINAL_PASS, LESSONS } from "@/content";

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const N = LESSONS.length;

// Optional filters: ?district=taraz&age=60%2B&from=2026-11-18&to=2026-11-30
export async function GET(req: Request) {
  if (!isAdmin(req)) return deny();
  const u = new URL(req.url);
  const district = u.searchParams.get("district") || null;
  const age = u.searchParams.get("age") || null;
  const from = u.searchParams.get("from") || null;
  const to = u.searchParams.get("to") || null;
  if ((from && !DATE.test(from)) || (to && !DATE.test(to))) return Response.json({ error: "bad date" }, { status: 400 });
  const sql = db();

  // One row per filtered participant with their progress; every report is grouped from it.
  // A certificate counts only if all lessons are done too (a forged "final" alone is not enough).
  const pp = sql`select p.id, p.district, p.age_group, p.created_at,
      coalesce(g.lessons, 0) as lessons, (coalesce(g.lessons, 0) >= ${N} and g.final >= ${FINAL_PASS}) as cert
    from participants p left join (
      select participant_id, count(*) filter (where lesson_id <> 'final') as lessons,
             max(score) filter (where lesson_id = 'final') as final
      from progress group by participant_id) g on g.participant_id = p.id
    where (${district}::text is null or p.district = ${district})
      and (${age}::text is null or p.age_group = ${age})
      and (${from}::date is null or p.created_at >= ${from}::date)
      and (${to}::date is null or p.created_at < ${to}::date + 1)`;

  const [totals, byDistrict, byAge, byLesson, byDay] = await sql.transaction((tx) => [
    tx`with pp as (${pp}) select count(*)::int as people,
         count(*) filter (where lessons > 0)::int as started,
         count(*) filter (where lessons >= ${N})::int as all_lessons,
         count(*) filter (where cert)::int as certified,
         coalesce(round(avg(lessons) filter (where lessons > 0), 1), 0)::float as avg_lessons from pp`,
    tx`with pp as (${pp}) select district as key, count(*)::int as people, count(*) filter (where cert)::int as certified
       from pp group by 1 order by people desc`,
    tx`with pp as (${pp}) select age_group as key, count(*)::int as people, count(*) filter (where cert)::int as certified
       from pp group by 1 order by 1`,
    tx`with pp as (${pp}) select g.lesson_id as key, count(*)::int as done, round(100.0 * avg(g.score::float / g.total))::int as avg_pct
       from progress g join pp on pp.id = g.participant_id group by 1 order by 1`,
    tx`with pp as (${pp}) select to_char(created_at at time zone 'Asia/Almaty', 'YYYY-MM-DD') as key, count(*)::int as people
       from pp group by 1 order by 1`,
  ], { readOnly: true });

  return Response.json({ totals: (totals as Record<string, unknown>[])[0], byDistrict, byAge, byLesson, byDay });
}
