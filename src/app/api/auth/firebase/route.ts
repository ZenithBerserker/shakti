import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CUSTOMER_COOKIE,
  CUSTOMER_COOKIE_MAX_AGE,
  cookieBaseOptions,
  signCustomerToken,
} from "@/lib/auth/session";
import { jsonError } from "@/lib/api/errors";
import { verifyFirebaseIdToken } from "@/lib/firebase-admin";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

const bodySchema = z.object({
  idToken: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonError("Invalid body", 422);
    }

    let decoded;
    try {
      decoded = await verifyFirebaseIdToken(parsed.data.idToken);
    } catch {
      return jsonError("Invalid Firebase token", 401);
    }

    const phone = decoded.phone_number as string | undefined;
    const firebaseUid = decoded.uid;

    if (!phone) {
      return jsonError("Phone number missing on Firebase token", 400);
    }

    const user = await prisma.user.upsert({
      where: { firebaseUid },
      update: { phone },
      create: {
        firebaseUid,
        phone,
        role: Role.CUSTOMER,
      },
    });

    await prisma.cart.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const jwt = await signCustomerToken(user.id);
    const jar = await cookies();
    jar.set(CUSTOMER_COOKIE, jwt, cookieBaseOptions(CUSTOMER_COOKIE_MAX_AGE));

    return NextResponse.json({
      user: {
        id: user.id,
        phone: user.phone,
        businessName: user.businessName,
        contactPerson: user.contactPerson,
        email: user.email,
        gstin: user.gstin,
        businessType: user.businessType,
        profileComplete: Boolean(
          user.businessName &&
            user.contactPerson &&
            user.email &&
            user.gstin &&
            user.businessType,
        ),
      },
    });
  } catch (e) {
    console.error("[auth/firebase]", e);
    return jsonError(
      e instanceof Error ? e.message : "Authentication failed",
      500,
    );
  }
}
