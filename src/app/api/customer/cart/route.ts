import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireCustomer } from "@/lib/api/customer-auth";
import { prisma } from "@/lib/prisma";
import { productInclude } from "@/lib/catalog";
import {
  effectiveUnitPrice,
  lineGstAmount,
  validateOrderQuantity,
} from "@/lib/pricing";
import { DEFAULT_SHIPPING_FLAT, LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { decToString } from "@/lib/money";

export async function GET() {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: { product: { include: productInclude } },
      },
    },
  });

  if (!cart) {
    return jsonOk({
      items: [],
      subTotal: "0.00",
      totalGst: "0.00",
      shipping: decToString(DEFAULT_SHIPPING_FLAT),
      grandTotal: decToString(DEFAULT_SHIPPING_FLAT),
    });
  }

  let subTotal = 0;
  let totalGst = 0;

  const items = cart.items.map((row) => {
    const p = row.product;
    const unit = effectiveUnitPrice(p, row.quantity);
    const gstRate = Number(p.gstRate);
    const gst = lineGstAmount(unit, row.quantity, gstRate);
    const linePre = unit * row.quantity;
    const lineTot = linePre + gst;
    subTotal += linePre;
    totalGst += gst;
    let validationError: string | null = null;
    try {
      validateOrderQuantity(p, row.quantity);
    } catch (e) {
      validationError = e instanceof Error ? e.message : "Invalid quantity";
    }
    if (!p.isActive) {
      validationError = "Product unavailable";
    }
    if (row.quantity > p.stockQuantity) {
      validationError = "Insufficient stock";
    }
    return {
      productId: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      imageUrl: p.imageUrl,
      quantity: row.quantity,
      stockQuantity: p.stockQuantity,
      minOrderQty: p.minOrderQty,
      stepQty: p.stepQty,
      unitPricePreGst: decToString(unit),
      gstRate: decToString(p.gstRate),
      lineGst: decToString(gst),
      lineTotal: decToString(lineTot),
      validationError,
      lowStock: p.stockQuantity > 0 && p.stockQuantity < LOW_STOCK_THRESHOLD,
    };
  });

  const shipping = DEFAULT_SHIPPING_FLAT;
  const grandTotal = subTotal + totalGst + shipping;

  return jsonOk({
    items,
    subTotal: decToString(subTotal),
    totalGst: decToString(totalGst),
    shipping: decToString(shipping),
    grandTotal: decToString(grandTotal),
    hasBlockingErrors: items.some((i) => i.validationError !== null),
  });
}
