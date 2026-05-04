#!/usr/bin/env node
/**
 * Reads Firebase-related keys from `.env` then `.env.local` (local overrides wins)
 * and upserts each into Vercel Production (`vercel env add … production --force`).
 *
 * Requires: linked project (`npx vercel link`), logged-in CLI (`npx vercel login`).
 *
 * After changing NEXT_PUBLIC_* vars, trigger a new deployment so the client bundle picks them up.
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const KEYS = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
];

/** Minimal KEY=value parser (single-line values; quoted values OK). */
function parseEnvFile(filePath) {
  if (!existsSync(filePath)) return {};
  const out = {};
  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1).replace(/\\"/g, '"').replace(/\\n/g, "\n");
    }
    out[key] = val;
  }
  return out;
}

function upsertToProduction(name, value) {
  const useStdin =
    name === "FIREBASE_PRIVATE_KEY" ||
    value.includes("\n") ||
    value.length > 4000;

  const base = ["vercel", "env", "add", name, "production", "--yes", "--force"];
  const args = useStdin ? base : [...base, "--value", value];

  const r = spawnSync("npx", args, {
    cwd: root,
    input: useStdin ? value : undefined,
    encoding: "utf8",
    stdio: useStdin ? ["pipe", "inherit", "inherit"] : ["inherit", "inherit", "inherit"],
  });

  if (r.status !== 0) {
    console.error(`Failed: ${name} (exit ${r.status ?? r.signal})`);
    process.exit(1);
  }
}

const merged = {
  ...parseEnvFile(join(root, ".env")),
  ...parseEnvFile(join(root, ".env.local")),
};

let pushed = 0;
for (const key of KEYS) {
  const value = merged[key];
  if (value === undefined || value === "") {
    console.warn(`Skipping empty: ${key}`);
    continue;
  }
  console.log(`→ ${key}`);
  upsertToProduction(key, value);
  pushed++;
}

if (pushed === 0) {
  console.warn("Nothing pushed — fill Firebase keys in .env or .env.local first.");
  process.exit(1);
}

console.log(`
Done (${pushed} variables). In Vercel: open the latest deployment → Redeploy (or push a commit).
NEXT_PUBLIC_* changes need a new build to appear in the browser.`);
