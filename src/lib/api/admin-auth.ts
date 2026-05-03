import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function getAdminFromCookies() {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const payload = await verifyAdminToken(token);
    const admin = await prisma.adminUser.findUnique({
      where: { id: payload.sub },
    });
    if (!admin) return null;
    if (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN) {
      return null;
    }
    return admin;
  } catch {
    return null;
  }
}

export async function requireAdmin() {
  const admin = await getAdminFromCookies();
  if (!admin) {
    return { error: "Unauthorized" as const, admin: null };
  }
  return { error: null, admin };
}
