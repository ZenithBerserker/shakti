/**
 * Loads `.env` then `.env.local` (override), strips Neon `channel_binding` from URLs, runs migrate.
 * Use this instead of raw `prisma migrate deploy` when DATABASE_URL only exists in `.env.local`.
 */
import { execSync } from "node:child_process";
import { config } from "dotenv";

import { sanitizePostgresUrl } from "../src/lib/database-url";

config({ path: ".env" });
config({ path: ".env.local", override: true });

for (const key of ["DATABASE_URL", "DIRECT_URL"] as const) {
  const v = process.env[key]?.trim();
  if (v) process.env[key] = sanitizePostgresUrl(v);
}

if (!process.env.DIRECT_URL?.trim()) {
  console.warn(
    "\n⚠️  DIRECT_URL is empty — migrate uses DATABASE_URL only.\n" +
      "   Add Neon’s **direct** (non-pooler) URI as DIRECT_URL so migrations don’t rely on the pooler.\n",
  );
} else if (process.env.DIRECT_URL.includes("-pooler")) {
  console.warn(
    "\n⚠️  DIRECT_URL looks like a pooler host (-pooler).\n" +
      "   Use Neon’s **Direct connection** string for DIRECT_URL (hostname usually has no “-pooler”).\n",
  );
}

if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL is missing. Add it to .env or .env.local.");
  process.exit(1);
}

execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
