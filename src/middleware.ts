import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, CUSTOMER_COOKIE } from "@/lib/auth/session-cookies";

/** Edge-safe: never throw — a missing secret is handled like an invalid session. */
function jwtSecretKey(): Uint8Array | null {
  const raw = process.env.JWT_SECRET;
  if (raw && raw.length >= 16) {
    return new TextEncoder().encode(raw);
  }
  if (process.env.NODE_ENV !== "production") {
    return new TextEncoder().encode("dev-insecure-jwt-secret");
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = jwtSecretKey();

  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/demo")) {
      return NextResponse.next();
    }
    if (!secret) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
      });
      if (payload.typ !== "admin") throw new Error("invalid");
      const role = payload.role as string;
      if (role !== "ADMIN" && role !== "SUPER_ADMIN") throw new Error("role");
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const customerProtected =
    pathname === "/cart" ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/addresses") ||
    pathname.startsWith("/register");

  if (customerProtected) {
    if (!secret) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    const token = request.cookies.get(CUSTOMER_COOKIE)?.value;
    if (!token) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
    try {
      const { payload } = await jwtVerify(token, secret, {
        algorithms: ["HS256"],
      });
      if (payload.typ !== "customer") throw new Error("invalid");
      return NextResponse.next();
    } catch {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname);
      return NextResponse.redirect(login);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cart",
    "/checkout/:path*",
    "/orders/:path*",
    "/profile/:path*",
    "/addresses/:path*",
    "/register",
    "/register/:path*",
  ],
};
