import { PrismaClient } from "@prisma/client";

/**
 * Neon’s dashboard often appends `channel_binding=require`. Some Node/serverless TLS stacks
 * (including Vercel) fail handshakes with that flag — Prisma may surface it as P1001 “Can’t reach database”.
 */
function sanitizeDatabaseUrl(url: string): string {
  const q = url.indexOf("?");
  if (q === -1) return url;
  const base = url.slice(0, q);
  const params = new URLSearchParams(url.slice(q + 1));
  params.delete("channel_binding");
  const tail = params.toString();
  return tail ? `${base}?${tail}` : base;
}

const rawDbUrl = process.env.DATABASE_URL?.trim();
const databaseUrl =
  rawDbUrl && rawDbUrl.length > 0 ? sanitizeDatabaseUrl(rawDbUrl) : undefined;

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
