import { config } from "dotenv";

import { sanitizePostgresUrl } from "./database-url";

/** Load `.env` then `.env.local`, strip `channel_binding` from Postgres URLs. */
export function loadPrismaCliEnv(): void {
  config({ path: ".env" });
  config({ path: ".env.local", override: true });

  for (const key of ["DATABASE_URL", "DIRECT_URL", "DATABASE_URL_DIRECT"] as const) {
    const v = process.env[key]?.trim();
    if (v) process.env[key] = sanitizePostgresUrl(v);
  }

  /** When laptop/network cannot reach Neon’s pooler, set this to Neon’s **direct** URI — overrides DATABASE_URL for CLI only. */
  const directFallback = process.env.DATABASE_URL_DIRECT?.trim();
  if (directFallback) {
    process.env.DATABASE_URL = sanitizePostgresUrl(directFallback);
  }
}

export function assertDirectUrlNotPooler(): void {
  const d = process.env.DIRECT_URL?.trim();
  if (!d) {
    console.warn(
      "\n⚠️  DIRECT_URL is empty — migrations should use Neon’s **direct** connection string.\n",
    );
    return;
  }
  if (d.includes("-pooler")) {
    console.error(
      "\n❌ DIRECT_URL must use Neon’s **Direct** connection string (hostname does NOT contain “-pooler”).\n" +
        "   Neon dashboard → Connection details → switch pooled URI to **Direct**, copy into DIRECT_URL.\n",
    );
    process.exit(1);
  }
}
