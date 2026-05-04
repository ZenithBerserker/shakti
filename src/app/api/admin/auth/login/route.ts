import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
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

export async function POST(req: Request) {
  try {
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
    return jsonError(
      "Could not reach database — check DATABASE_URL and that migrations ran.",
      503,
    );
  }
}
