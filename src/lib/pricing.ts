import type { PricingTier, Product } from "@prisma/client";

export type ProductWithTiers = Product & { pricingTiers: PricingTier[] };

/** Effective pre-GST unit price after volume tiers (best tier where qty ≥ minQuantity). */
export function effectiveUnitPrice(product: ProductWithTiers, quantity: number): number {
  const base = Number(product.basePrice);
  const tiers = [...product.pricingTiers].sort(
    (a, b) => b.minQuantity - a.minQuantity,
  );
  for (const t of tiers) {
    if (quantity >= t.minQuantity) {
      return Number(t.discountPrice);
    }
  }
  return base;
}

export function lineGstAmount(unitPreGst: number, qty: number, gstRatePercent: number) {
  const taxable = unitPreGst * qty;
  return Math.round(taxable * (gstRatePercent / 100) * 100) / 100;
}

export function validateOrderQuantity(product: Product, quantity: number) {
  if (quantity < product.minOrderQty) {
    throw new Error(`Minimum order quantity is ${product.minOrderQty}`);
  }
  const excess = quantity - product.minOrderQty;
  if (excess % product.stepQty !== 0) {
    throw new Error(
      `Quantity must increase in steps of ${product.stepQty} after MOQ ${product.minOrderQty}`,
    );
  }
}
