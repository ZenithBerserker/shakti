/**
 * Loads `.env` then `.env.local` (override), strips Neon `channel_binding`, optional DATABASE_URL_DIRECT for CLI.
 */
import { execSync } from "node:child_process";

import {
  assertDirectUrlNotPooler,
  loadPrismaCliEnv,
} from "../src/lib/prisma-cli-env";

loadPrismaCliEnv();
assertDirectUrlNotPooler();

if (!process.env.DATABASE_URL?.trim()) {
  console.error(
    "DATABASE_URL is missing. Add Neon pooled URI to DATABASE_URL, or set DATABASE_URL_DIRECT to Neon's **direct** URI if pooler won't connect.",
  );
  process.exit(1);
}

try {
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
} catch {
  console.error(
    "\nMigrate failed (see Prisma output above). Wake DB in Neon → SQL Editor; confirm DIRECT_URL is **direct** (non-pooler).\n",
  );
  process.exit(1);
}
