import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE } from "@/lib/auth/session";

export async function POST() {
  const jar = await cookies();
  jar.set(CUSTOMER_COOKIE, "", { path: "/", maxAge: 0 });
  return NextResponse.json({ ok: true });
}
