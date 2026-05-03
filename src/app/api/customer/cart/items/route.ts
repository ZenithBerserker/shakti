import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireCustomer } from "@/lib/api/customer-auth";
import { prisma } from "@/lib/prisma";
import { productInclude } from "@/lib/catalog";
import { validateOrderQuantity } from "@/lib/pricing";

const bodySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(0),
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
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  const cart = await ensureCart(userId);

  if (parsed.data.quantity === 0) {
    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: parsed.data.productId,
      },
    });
    return jsonOk({ ok: true });
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    include: productInclude,
  });
  if (!product || !product.isActive) {
    return jsonError("Product not available", 404);
  }

  try {
    validateOrderQuantity(product, parsed.data.quantity);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : "Invalid quantity", 422);
  }

  if (parsed.data.quantity > product.stockQuantity) {
    return jsonError("Insufficient stock", 409);
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId: parsed.data.productId,
      },
    },
    update: { quantity: parsed.data.quantity },
    create: {
      cartId: cart.id,
      productId: parsed.data.productId,
      quantity: parsed.data.quantity,
    },
  });

  return jsonOk({ ok: true }, 201);
}

export async function DELETE(req: Request) {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const productId = new URL(req.url).searchParams.get("productId");
  const parsedId = z.string().uuid().safeParse(productId);
  if (!parsedId.success) return jsonError("productId required", 400);

  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return jsonOk({ ok: true });

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId: parsedId.data },
  });
  return jsonOk({ ok: true });
}
