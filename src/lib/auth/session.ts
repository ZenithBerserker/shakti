import { SignJWT, jwtVerify } from "jose";

import { ADMIN_COOKIE, CUSTOMER_COOKIE } from "@/lib/auth/session-cookies";

export { ADMIN_COOKIE, CUSTOMER_COOKIE } from "@/lib/auth/session-cookies";

const DAY_MS = 86_400_000;

export type AdminRole = "ADMIN" | "SUPER_ADMIN";

function secretKey() {
  const raw = process.env.JWT_SECRET;
  if (raw && raw.length >= 16) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET must be set in production (min 16 chars)");
  }
  return new TextEncoder().encode("dev-insecure-jwt-secret");
}

export type CustomerJwtPayload = {
  sub: string;
  typ: "customer";
};

export type AdminJwtPayload = {
  sub: string;
  typ: "admin";
  role: AdminRole;
};

export async function signCustomerToken(userId: string) {
  return new SignJWT({ typ: "customer" satisfies CustomerJwtPayload["typ"] })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30}s`)
    .sign(secretKey());
}

export async function signAdminToken(adminId: string, role: AdminRole) {
  return new SignJWT({
    typ: "admin",
    role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(adminId)
    .setIssuedAt()
    .setExpirationTime(`${Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7}s`)
    .sign(secretKey());
}

export async function verifyCustomerToken(token: string) {
  const { payload } = await jwtVerify(token, secretKey(), {
    algorithms: ["HS256"],
  });
  if (payload.typ !== "customer" || typeof payload.sub !== "string") {
    throw new Error("Invalid customer token");
  }
  return payload.sub;
}

export async function verifyAdminToken(token: string): Promise<AdminJwtPayload> {
  const { payload } = await jwtVerify(token, secretKey(), {
    algorithms: ["HS256"],
  });
  const role = payload.role as string | undefined;
  if (
    payload.typ !== "admin" ||
    typeof payload.sub !== "string" ||
    (role !== "ADMIN" && role !== "SUPER_ADMIN")
  ) {
    throw new Error("Invalid admin token");
  }
  return {
    sub: payload.sub,
    typ: "admin",
    role,
  };
}

export function cookieBaseOptions(maxAgeMs: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.floor(maxAgeMs / 1000),
  };
}

export const CUSTOMER_COOKIE_MAX_AGE = 30 * DAY_MS;
export const ADMIN_COOKIE_MAX_AGE = 7 * DAY_MS;
