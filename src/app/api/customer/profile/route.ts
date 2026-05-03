import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireCustomer } from "@/lib/api/customer-auth";
import { prisma } from "@/lib/prisma";
const patchSchema = z.object({
  businessName: z.string().min(2).max(200),
  contactPerson: z.string().min(2).max(120),
  email: z.string().email(),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format",
    ),
  businessType: z.enum([
    "Hotel",
    "Hospital",
    "Facility Management",
    "Retail",
    "Manufacturing",
    "Education",
    "Corporate Office",
    "Other",
  ]),
});

export async function PATCH(req: Request) {
  const { error, userId } = await requireCustomer();
  if (error || !userId) {
    return jsonError("Unauthorized", 401);
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.message, 422);
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        businessName: parsed.data.businessName,
        contactPerson: parsed.data.contactPerson,
        email: parsed.data.email,
        gstin: parsed.data.gstin,
        businessType: parsed.data.businessType,
        isVerified: true,
      },
    });

    return jsonOk({
      id: updated.id,
      phone: updated.phone,
      businessName: updated.businessName,
      contactPerson: updated.contactPerson,
      email: updated.email,
      gstin: updated.gstin,
      businessType: updated.businessType,
      profileComplete: true,
    });
  } catch (e) {
    console.error("[customer/profile]", e);
    return jsonError("Could not save profile (duplicate email?)", 409);
  }
}
