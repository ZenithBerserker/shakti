import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { decToString } from "@/lib/money";
import type { Prisma } from "@prisma/client";

export const productInclude = {
  category: true,
  pricingTiers: true,
} satisfies Prisma.ProductInclude;

export type ProductPayload = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

export function serializeProduct(p: ProductPayload) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    imageUrl: p.imageUrl,
    basePrice: decToString(p.basePrice),
    gstRate: decToString(p.gstRate),
    hsnCode: p.hsnCode,
    stockQuantity: p.stockQuantity,
    minOrderQty: p.minOrderQty,
    stepQty: p.stepQty,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    inStock: p.stockQuantity > 0,
    lowStock:
      p.stockQuantity > 0 && p.stockQuantity < LOW_STOCK_THRESHOLD,
    category: {
      id: p.category.id,
      name: p.category.name,
      slug: p.category.slug,
    },
    pricingTiers: p.pricingTiers
      .map((t) => ({
        minQuantity: t.minQuantity,
        discountPrice: decToString(t.discountPrice),
      }))
      .sort((a, b) => a.minQuantity - b.minQuantity),
  };
}

export type SerializedCatalogProduct = ReturnType<typeof serializeProduct>;
