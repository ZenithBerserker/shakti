import { z } from "zod";
import { OrderStatus } from "@prisma/client";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/orders-serialize";
import { idParamSchema } from "@/lib/validation/common";

const patchSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Params) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const parsed = idParamSchema.safeParse(id);
  if (!parsed.success) return jsonError("Invalid id", 400);

  const order = await prisma.order.findUnique({
    where: { id: parsed.data },
    include: {
      items: true,
      user: {
        select: {
          phone: true,
          businessName: true,
          contactPerson: true,
          email: true,
          gstin: true,
          businessType: true,
        },
      },
    },
  });
  if (!order) return jsonError("Not found", 404);

  return jsonOk({
    order: serializeOrder(order),
    customer: order.user,
  });
}

export async function PATCH(req: Request, ctx: Params) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const parsedId = idParamSchema.safeParse(id);
  if (!parsedId.success) return jsonError("Invalid id", 400);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  try {
    const updated = await prisma.order.update({
      where: { id: parsedId.data },
      data: { status: parsed.data.status },
      include: { items: true },
    });
    return jsonOk(serializeOrder(updated));
  } catch {
    return jsonError("Not found", 404);
  }
}
