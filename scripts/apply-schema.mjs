import { neon } from "@neondatabase/serverless";
import { readFileSync } from "node:fs";

const url = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!url) {
  console.log("apply-schema: no DATABASE_URL, skipped");
  process.exit(0);
}
const sql = neon(url);
const ddl = readFileSync(new URL("./schema.sql", import.meta.url), "utf8");
for (const stmt of ddl.split(";").map((s) => s.replace(/--.*$/gm, "").trim()).filter(Boolean)) {
  await sql.query(stmt);
}
console.log("apply-schema: ok");
