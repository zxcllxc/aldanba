import { timingSafeEqual, createHash } from "node:crypto";

/** Admin auth: password from ADMIN_PASSWORD env, sent in the x-admin-key header. */
export function isAdmin(req: Request): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  const got = req.headers.get("x-admin-key");
  if (!expected || !got) return false;
  const a = createHash("sha256").update(got).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export const deny = () => Response.json({ error: "unauthorized" }, { status: 401 });
