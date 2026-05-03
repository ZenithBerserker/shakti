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
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  const admin = await prisma.adminUser.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });

  if (!admin) {
    return jsonError("Invalid credentials", 401);
  }

  const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
  if (!ok) {
    return jsonError("Invalid credentials", 401);
  }

  const jwt = await signAdminToken(admin.id, admin.role as AdminRole);

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
}
