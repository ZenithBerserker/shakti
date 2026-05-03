import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireCustomer } from "@/lib/api/customer-auth";
import { prisma } from "@/lib/prisma";
import { idParamSchema } from "@/lib/validation/common";

const patchSchema = z.object({
  title: z.string().min(2).max(80).optional(),
  streetAddress: z.string().min(3).max(300).optional(),
  city: z.string().min(2).max(80).optional(),
  state: z.string().min(2).max(80).optional(),
  pincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit PIN")
    .optional(),
  isDefault: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Params) {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const idParsed = idParamSchema.safeParse(id);
  if (!idParsed.success) return jsonError("Invalid id", 400);

  const existing = await prisma.address.findFirst({
    where: { id: idParsed.data, userId },
  });
  if (!existing) return jsonError("Not found", 404);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  const updated = await prisma.$transaction(async (tx) => {
    if (parsed.data.isDefault) {
      await tx.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    return tx.address.update({
      where: { id: idParsed.data },
      data: {
        ...parsed.data,
      },
    });
  });

  return jsonOk(updated);
}

export async function DELETE(_req: Request, ctx: Params) {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const idParsed = idParamSchema.safeParse(id);
  if (!idParsed.success) return jsonError("Invalid id", 400);

  const existing = await prisma.address.findFirst({
    where: { id: idParsed.data, userId },
  });
  if (!existing) return jsonError("Not found", 404);

  await prisma.address.delete({ where: { id: idParsed.data } });

  if (existing.isDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return jsonOk({ ok: true });
}
