import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  cookieBaseOptions,
  signAdminToken,
} from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/api/errors";
import type { AdminRole } from "@/lib/auth/session";
import { Role } from "@prisma/client";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(2).max(120).optional(),
});

function secretsMatch(expected: string, received: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(received, "utf8");
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * One-time (or recovery) admin creation when the database has zero admins.
 * Guarded by ADMIN_BOOTSTRAP_SECRET — set on Vercel, call once, then remove the secret.
 */
export async function POST(req: Request) {
  const expected = process.env.ADMIN_BOOTSTRAP_SECRET?.trim();
  if (!expected || expected.length < 16) {
    return jsonError("Bootstrap is disabled (set ADMIN_BOOTSTRAP_SECRET, min 16 chars)", 503);
  }

  const provided =
    req.headers.get("x-admin-bootstrap-secret")?.trim() ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ??
    "";

  if (!secretsMatch(expected, provided)) {
    return jsonError("Unauthorized", 401);
  }

  const existingCount = await prisma.adminUser.count();
  if (existingCount > 0) {
    return jsonError(
      "Admin users already exist — use db seed locally or reset password in the database.",
      403,
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  const email = parsed.data.email.toLowerCase();
  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const admin = await prisma.adminUser.create({
    data: {
      email,
      passwordHash,
      name: parsed.data.name ?? "Administrator",
      role: Role.ADMIN,
    },
  });

  let jwt: string;
  try {
    jwt = await signAdminToken(admin.id, admin.role as AdminRole);
  } catch (e) {
    console.error("[admin/bootstrap] JWT", e);
    return jsonError(
      "Admin created but JWT_SECRET is invalid — set JWT_SECRET (min 16 chars) and sign in normally.",
      500,
    );
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, jwt, cookieBaseOptions(ADMIN_COOKIE_MAX_AGE));

  return jsonOk({
    ok: true,
    message:
      "First admin created and session cookie set. Remove ADMIN_BOOTSTRAP_SECRET from env after setup.",
    admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
  });
}
