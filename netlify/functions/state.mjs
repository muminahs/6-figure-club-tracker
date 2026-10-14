import { getStore } from "@netlify/blobs";
import seed from "../../data/seed.mjs";

const KEY = "state";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

// Compare without leaking how many characters matched.
function samePasscode(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

const isInt = (n, lo, hi) => Number.isInteger(n) && n >= lo && n <= hi;
const isDate = (d) => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);

function validState(s) {
  if (!s || typeof s !== "object") return false;
  if (!isInt(s.members, 0, 500) || !isInt(s.goal, 1, 500) || !isInt(s.startMembers, 0, 500)) return false;
  if (typeof s.pricePerYear !== "number" || !(s.pricePerYear >= 0)) return false;
  if (!isDate(s.startDate) || !isDate(s.deadline)) return false;
  if (!Array.isArray(s.log) || s.log.length > 2000) return false;
  if (!Array.isArray(s.history) || s.history.length > 10000) return false;
  if (!s.names || typeof s.names !== "object" || Array.isArray(s.names)) return false;
  return JSON.stringify(s).length < 500000;
}

export default async (req) => {
  const store = getStore({ name: "six-figure-club", consistency: "strong" });
  const current = async () => (await store.get(KEY, { type: "json" })) || { version: 0, state: seed };

  if (req.method === "GET") return json(await current());

  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const passcode = process.env.ADMIN_PASSCODE;
  if (!passcode) return json({ error: "the site has no ADMIN_PASSCODE set yet" }, 500);
  if (!samePasscode(req.headers.get("x-passcode") || "", passcode)) {
    await new Promise((r) => setTimeout(r, 700)); // slow down guessing
    return json({ error: "wrong passcode" }, 401);
  }

  let body;
  try { body = await req.json(); } catch { return json({ error: "bad request" }, 400); }
  if (body && body.check) return json({ ok: true });

  const cur = await current();
  if (body.base !== cur.version) return json({ error: "conflict", ...cur }, 409);
  if (!validState(body.state)) return json({ error: "that update didn't look right, so it wasn't saved" }, 400);

  const rec = { version: cur.version + 1, savedAt: new Date().toISOString(), state: body.state };
  await store.setJSON(KEY, rec);
  return json(rec);
};

export const config = { path: "/api/state" };
