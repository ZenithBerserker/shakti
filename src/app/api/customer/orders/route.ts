import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireCustomer } from "@/lib/api/customer-auth";
import { prisma } from "@/lib/prisma";
import {
  effectiveUnitPrice,
  lineGstAmount,
  validateOrderQuantity,
} from "@/lib/pricing";
import { DEFAULT_SHIPPING_FLAT } from "@/lib/constants";
import { generateOrderNumber } from "@/lib/order-number";
import { serializeOrder } from "@/lib/orders-serialize";
import { whatsappOrderDeepLink } from "@/lib/whatsapp";
import { BUSINESS_WHATSAPP_E164 } from "@/lib/constants";

const checkoutSchema = z.object({
  addressId: z.string().uuid(),
  customerNotes: z.string().max(800).optional(),
});

export async function GET(req: Request) {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    40,
    Math.max(1, Number(searchParams.get("pageSize") ?? "10")),
  );

  const [total, rows] = await prisma.$transaction([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return jsonOk({
    page,
    pageSize,
    total,
    items: rows.map(serializeOrder),
  });
}

export async function POST(req: Request) {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return jsonError("Unauthorized", 401);

  const address = await prisma.address.findFirst({
    where: { id: parsed.data.addressId, userId },
  });
  if (!address) return jsonError("Address not found", 404);

  try {
    const order = await prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              product: { include: { pricingTiers: true } },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("EMPTY_CART");
      }

      let subTotal = 0;
      let totalGst = 0;
      const lineCreates: {
        productId: string;
        productName: string;
        sku: string;
        quantity: number;
        unitPricePaid: number;
        gstAmountPaid: number;
        totalPrice: number;
      }[] = [];

      for (const row of cart.items) {
        const fresh = await tx.product.findUnique({
          where: { id: row.productId },
          include: { pricingTiers: true },
        });
        if (!fresh || !fresh.isActive) {
          throw new Error(`PRODUCT_UNAVAILABLE:${row.productId}`);
        }

        validateOrderQuantity(fresh, row.quantity);

        if (fresh.stockQuantity < row.quantity) {
          throw new Error(`INSUFFICIENT_STOCK:${fresh.name}`);
        }

        const unit = effectiveUnitPrice(fresh, row.quantity);
        const gstRate = Number(fresh.gstRate);
        const gstAmt = lineGstAmount(unit, row.quantity, gstRate);
        const linePre = unit * row.quantity;
        subTotal += linePre;
        totalGst += gstAmt;

        lineCreates.push({
          productId: fresh.id,
          productName: fresh.name,
          sku: fresh.sku,
          quantity: row.quantity,
          unitPricePaid: unit,
          gstAmountPaid: gstAmt,
          totalPrice: linePre + gstAmt,
        });

        await tx.product.update({
          where: { id: fresh.id },
          data: { stockQuantity: { decrement: row.quantity } },
        });
      }

      const shipping = DEFAULT_SHIPPING_FLAT;
      const grandTotal = subTotal + totalGst + shipping;

      const deliveryName =
        user.contactPerson ??
        user.businessName ??
        address.title ??
        user.phone;

      const created = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId,
          deliveryName,
          deliveryAddress: address.streetAddress,
          deliveryCity: address.city,
          deliveryState: address.state,
          deliveryPincode: address.pincode,
          customerNotes: parsed.data.customerNotes,
          subTotal,
          totalGst,
          shippingCost: shipping,
          grandTotal,
          items: {
            createMany: {
              data: lineCreates.map((l) => ({
                productId: l.productId,
                productName: l.productName,
                sku: l.sku,
                quantity: l.quantity,
                unitPricePaid: l.unitPricePaid,
                gstAmountPaid: l.gstAmountPaid,
                totalPrice: l.totalPrice,
              })),
            },
          },
        },
        include: { items: true },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created;
    });

    let whatsappNotifyUrl: string | null = null;
    if (BUSINESS_WHATSAPP_E164) {
      whatsappNotifyUrl = whatsappOrderDeepLink(
        order.orderNumber,
        String(order.grandTotal),
        BUSINESS_WHATSAPP_E164,
      );
    }

    return jsonOk({
      order: serializeOrder(order),
      whatsappNotifyUrl,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Checkout failed";
    if (msg === "EMPTY_CART") return jsonError("Cart is empty", 400);
    if (msg.startsWith("PRODUCT_UNAVAILABLE")) {
      return jsonError("A product in your cart is no longer available", 409);
    }
    if (msg.startsWith("INSUFFICIENT_STOCK")) {
      return jsonError(msg.split(":")[1] ?? "Insufficient stock", 409);
    }
    console.error("[checkout]", e);
    return jsonError(msg, 500);
  }
}
