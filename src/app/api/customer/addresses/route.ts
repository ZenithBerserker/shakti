import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireCustomer } from "@/lib/api/customer-auth";
import { prisma } from "@/lib/prisma";

const addressSchema = z.object({
  title: z.string().min(2).max(80),
  streetAddress: z.string().min(3).max(300),
  city: z.string().min(2).max(80),
  state: z.string().min(2).max(80),
  pincode: z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN"),
  isDefault: z.boolean().optional(),
});

export async function GET() {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const rows = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
  });
  return jsonOk(rows);
}

export async function POST(req: Request) {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.message, 422);
  }

  const created = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    const count = await tx.address.count({ where: { userId } });
    const isDefault =
      parsed.data.isDefault !== undefined
        ? parsed.data.isDefault
        : count === 0;

    if (isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data: {
        userId,
        title: parsed.data.title,
        streetAddress: parsed.data.streetAddress,
        city: parsed.data.city,
        state: parsed.data.state,
        pincode: parsed.data.pincode,
        isDefault,
      },
    });
  });

  return jsonOk(created, 201);
}
