import { PrismaClient } from "@prisma/client";

import { sanitizePostgresUrl } from "@/lib/database-url";

const rawDbUrl = process.env.DATABASE_URL?.trim();
const databaseUrl =
  rawDbUrl && rawDbUrl.length > 0 ? sanitizePostgresUrl(rawDbUrl) : undefined;

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
