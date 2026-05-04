import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  cookieBaseOptions,
  signAdminToken,
  type AdminRole,
} from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6),
});

function databaseUrlConfigured(): string | null {
  const raw = process.env.DATABASE_URL?.trim();
  if (!raw) {
    return "DATABASE_URL is empty — open Vercel → your project → Settings → Environment Variables → Production → add the Supabase Postgres URI.";
  }
  const bogus =
    raw.includes("[project-ref]") ||
    raw.includes("[password]") ||
    /postgresql:\/\/postgres:\[password\]/i.test(raw);
  if (bogus) {
    return "DATABASE_URL still looks like the template — copy the real URI from Supabase → Project Settings → Database → Connection string (URI), Transaction pooler.";
  }
  return null;
}

function describeDatabaseError(e: unknown): string {
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2021") {
      return "Tables are missing — from your laptop run: DATABASE_URL=\"…pooler…\" DIRECT_URL=\"…direct…\" npx prisma migrate deploy";
    }
    if (e.code === "P1001") {
      return "Cannot reach Postgres — confirm DATABASE_URL uses Supabase pooler (port 6543), ?pgbouncer=true, and the database is not paused.";
    }
  }
  if (e instanceof Prisma.PrismaClientInitializationError) {
    return `Database driver failed to start: ${e.message}`;
  }
  const msg = e instanceof Error ? e.message : String(e);
  if (/admin_users|does not exist|P2021/i.test(msg)) {
    return "Schema missing — run prisma migrate deploy against this DATABASE_URL.";
  }
  if (/P1001|ECONNREFUSED|ENOTFOUND|timeout|Can't reach database/i.test(msg)) {
    return "Network/ssl connection to Postgres failed — double-check DATABASE_URL and Supabase project region.";
  }
  return "Could not query Postgres — verify DATABASE_URL on Vercel and run prisma migrate deploy.";
}

export async function POST(req: Request) {
  try {
    const misconfigured = databaseUrlConfigured();
    if (misconfigured) return jsonError(misconfigured, 503);

    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError(parsed.error.message, 422);

    const admin = await prisma.adminUser.findUnique({
      where: { email: parsed.data.email.toLowerCase() },
    });

    if (!admin) {
      return jsonError(
        "Invalid credentials — no admin account with this email. Run npm run db:seed or npm run admin:create locally, or use one-time bootstrap on production (see README).",
        401,
      );
    }

    const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
    if (!ok) {
      return jsonError("Invalid credentials — wrong password.", 401);
    }

    let jwt: string;
    try {
      jwt = await signAdminToken(admin.id, admin.role as AdminRole);
    } catch (e) {
      console.error("[admin/login] JWT", e);
      const msg = e instanceof Error ? e.message : "JWT error";
      if (msg.includes("JWT_SECRET")) {
        return jsonError(
          "Server misconfigured: set JWT_SECRET (min 16 characters) in environment variables.",
          503,
        );
      }
      return jsonError("Could not issue session token.", 500);
    }

    const jar = await cookies();
    jar.set(ADMIN_COOKIE, jwt, cookieBaseOptions(ADMIN_COOKIE_MAX_AGE));

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    return jsonOk({
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });
  } catch (e) {
    console.error("[admin/login]", e);
    return jsonError(describeDatabaseError(e), 503);
  }
}
