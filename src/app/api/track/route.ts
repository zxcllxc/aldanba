import { db } from "@/lib/db";
import { AGE_IDS, DISTRICT_IDS } from "@/lib/i18n";
import { FINAL_ID, LESSON_IDS } from "@/content";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const int = (v: unknown, max: number) => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= max;

export async function POST(req: Request) {
  let b: Record<string, unknown>;
  try {
    b = await req.json();
  } catch {
    return Response.json({ error: "bad json" }, { status: 400 });
  }
  const { id, lang, age, district, lesson, score, total } = b;
  const ok =
    typeof id === "string" && UUID.test(id) &&
    (lang === "kk" || lang === "ru") &&
    typeof age === "string" && AGE_IDS.has(age) &&
    typeof district === "string" && DISTRICT_IDS.has(district);
  if (!ok) return Response.json({ error: "bad profile" }, { status: 400 });

  const sql = db();
  if (lesson === undefined) {
    await sql`insert into participants (id, lang, age_group, district) values (${id}, ${lang}, ${age}, ${district})
      on conflict (id) do update set lang = excluded.lang, age_group = excluded.age_group,
        district = excluded.district, last_seen = now()`;
    return Response.json({ ok: true });
  }

  const validLesson = typeof lesson === "string" && (LESSON_IDS.has(lesson) || lesson === FINAL_ID);
  if (!validLesson || !int(total, 20) || !int(score, total as number) || (total as number) < 1)
    return Response.json({ error: "bad result" }, { status: 400 });

  // One round trip: make sure the participant exists, then keep the best result per lesson.
  await sql`with p as (
      insert into participants (id, lang, age_group, district) values (${id}, ${lang}, ${age}, ${district})
      on conflict (id) do update set last_seen = now() returning id
    )
    insert into progress (participant_id, lesson_id, score, total)
    select id, ${lesson}, ${score}, ${total} from p
    on conflict (participant_id, lesson_id) do update
      set score = greatest(progress.score, excluded.score), total = excluded.total, completed_at = now()`;
  return Response.json({ ok: true });
}
