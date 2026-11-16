// Load test for /api/track. Test users get the id prefix 00000000-0000-4000-8000-
// and are removed with: node --env-file=.env.local scripts/load-test.mjs --cleanup
// Usage: node scripts/load-test.mjs https://site.vercel.app 200 30   (url, parallel users, seconds)
import { neon } from "@neondatabase/serverless";

if (process.argv.includes("--cleanup")) {
  const sql = neon(process.env.DATABASE_URL);
  const r = await sql`delete from participants where id::text like '00000000-0000-4000-8000-%' returning id`;
  console.log(`removed ${r.length} test participants`);
  process.exit(0);
}

const [url = "http://localhost:3000", users = "50", secs = "15"] = process.argv.slice(2);
const end = Date.now() + Number(secs) * 1000;
const districts = ["taraz", "baizak", "shu", "kordai", "merke"];
const ages = ["7-13", "14-17", "18-29", "30-44", "45-59", "60+"];
const lat = [];
let ok = 0, fail = 0, n = 0;

async function user() {
  while (Date.now() < end) {
    const id = `00000000-0000-4000-8000-${String(n++).padStart(12, "0")}`;
    const base = { id, lang: n % 2 ? "kk" : "ru", age: ages[n % 6], district: districts[n % 5] };
    // A real visit: register, then finish two lessons.
    for (const extra of [{}, { lesson: "l01", score: 2, total: 2 }, { lesson: "l02", score: 1, total: 2 }]) {
      const t = performance.now();
      try {
        const res = await fetch(`${url}/api/track`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ...base, ...extra }),
        });
        res.ok ? ok++ : fail++;
        if (!res.ok && fail < 5) console.log("HTTP", res.status, (await res.text()).slice(0, 120));
      } catch (e) {
        fail++;
        if (fail < 5) console.log("ERR", e.message);
      }
      lat.push(performance.now() - t);
    }
  }
}

await Promise.all(Array.from({ length: Number(users) }, user));
lat.sort((a, b) => a - b);
const p = (q) => Math.round(lat[Math.floor(lat.length * q)] ?? 0);
console.log(`requests: ${ok + fail}, ok: ${ok}, failed: ${fail}, rps: ${Math.round((ok + fail) / Number(secs))}`);
console.log(`latency ms p50=${p(0.5)} p95=${p(0.95)} p99=${p(0.99)}`);
