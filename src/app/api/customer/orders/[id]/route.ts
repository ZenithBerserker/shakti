import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireCustomer } from "@/lib/api/customer-auth";
import { prisma } from "@/lib/prisma";
import { serializeOrder } from "@/lib/orders-serialize";
import { idParamSchema } from "@/lib/validation/common";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Params) {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const parsed = idParamSchema.safeParse(id);
  if (!parsed.success) return jsonError("Invalid id", 400);

  const order = await prisma.order.findFirst({
    where: { id: parsed.data, userId },
    include: { items: true },
  });
  if (!order) return jsonError("Not found", 404);

  return jsonOk(serializeOrder(order));
}
