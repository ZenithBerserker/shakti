import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireCustomer } from "@/lib/api/customer-auth";
import { prisma } from "@/lib/prisma";
import { validateOrderQuantity } from "@/lib/pricing";

const schema = z.object({
  orderId: z.string().uuid(),
});

async function ensureCart(userId: string) {
  return prisma.cart.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

export async function POST(req: Request) {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  const order = await prisma.order.findFirst({
    where: { id: parsed.data.orderId, userId },
    include: { items: true },
  });
  if (!order) return jsonError("Order not found", 404);

  const cart = await ensureCart(userId);
  const warnings: string[] = [];

  await prisma.$transaction(async (tx) => {
    for (const line of order.items) {
      const product = await tx.product.findUnique({ where: { id: line.productId } });
      if (!product || !product.isActive) {
        warnings.push(`${line.productName} is unavailable now — skipped`);
        continue;
      }

      let qty = line.quantity;
      try {
        validateOrderQuantity(product, qty);
      } catch {
        qty = product.minOrderQty;
        warnings.push(
          `${line.productName} quantity adjusted to MOQ ${product.minOrderQty}`,
        );
      }

      if (qty > product.stockQuantity) {
        qty = product.stockQuantity;
        if (qty < product.minOrderQty) {
          warnings.push(`${line.productName} is out of stock — skipped`);
          continue;
        }
        warnings.push(`${line.productName} quantity capped to available stock`);
      }

      await tx.cartItem.upsert({
        where: {
          cartId_productId: { cartId: cart.id, productId: product.id },
        },
        update: { quantity: qty },
        create: {
          cartId: cart.id,
          productId: product.id,
          quantity: qty,
        },
      });
    }
  });

  return jsonOk({ ok: true, warnings });
}
