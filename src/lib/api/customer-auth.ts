import { cookies } from "next/headers";
import {
  CUSTOMER_COOKIE,
  verifyCustomerToken,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function getCustomerIdFromCookies() {
  const jar = await cookies();
  const token = jar.get(CUSTOMER_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyCustomerToken(token);
  } catch {
    return null;
  }
}

export async function requireCustomer() {
  const userId = await getCustomerIdFromCookies();
  if (!userId) {
    return { error: "Unauthorized" as const, userId: null, user: null };
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { error: "Unauthorized" as const, userId: null, user: null };
  }
  return { error: null, userId, user };
}
