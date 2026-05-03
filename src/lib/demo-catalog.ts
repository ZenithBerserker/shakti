import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  type DemoProductFixture,
} from "@/lib/catalog-demo-fixtures";
import type { SerializedCatalogProduct } from "@/lib/catalog";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { decToString } from "@/lib/money";
import {
  databaseUrlLooksUnsetOrPlaceholder,
  isMockCatalogServerEnv,
} from "@/lib/mock-catalog-flag";

export function isDemoCatalog(): boolean {
  return (
    isMockCatalogServerEnv() || databaseUrlLooksUnsetOrPlaceholder()
  );
}

function demoCategoryId(slug: string) {
  return `demo-cat-${slug}`;
}

function demoProductId(slug: string) {
  return `demo-prd-${slug}`;
}

export function serializeDemoProduct(p: DemoProductFixture): SerializedCatalogProduct {
  const cat = DEMO_CATEGORIES.find((c) => c.slug === p.categorySlug)!;
  const cid = demoCategoryId(cat.slug);
  const stockQuantity = p.stockQuantity;
  return {
    id: demoProductId(p.slug),
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    imageUrl: p.imageUrl,
    basePrice: decToString(p.basePrice),
    gstRate: decToString(p.gstRate),
    hsnCode: p.hsnCode,
    stockQuantity,
    minOrderQty: p.minOrderQty,
    stepQty: p.stepQty,
    isFeatured: p.isFeatured,
    isActive: true,
    inStock: stockQuantity > 0,
    lowStock: stockQuantity > 0 && stockQuantity < LOW_STOCK_THRESHOLD,
    category: {
      id: cid,
      name: cat.name,
      slug: cat.slug,
    },
    pricingTiers: (p.tiers ?? [])
      .map((t) => ({
        minQuantity: t.minQuantity,
        discountPrice: decToString(t.discountPrice),
      }))
      .sort((a, b) => a.minQuantity - b.minQuantity),
  };
}

const serializedDemoProducts = DEMO_PRODUCTS.map(serializeDemoProduct);

export function listDemoCategoriesForCatalog() {
  return DEMO_CATEGORIES.map((c) => ({
    id: demoCategoryId(c.slug),
    name: c.name,
    slug: c.slug,
  }));
}

export function listDemoCategoriesWithCounts() {
  return DEMO_CATEGORIES.map((c) => {
    const id = demoCategoryId(c.slug);
    const count = DEMO_PRODUCTS.filter((p) => p.categorySlug === c.slug).length;
    return {
      id,
      name: c.name,
      slug: c.slug,
      _count: { products: count },
    };
  });
}

export function listDemoCategoriesForApi() {
  return DEMO_CATEGORIES.map((c) => {
    const id = demoCategoryId(c.slug);
    const productCount = DEMO_PRODUCTS.filter((p) => p.categorySlug === c.slug).length;
    return {
      id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      productCount,
    };
  });
}

export type DemoCatalogFilters = {
  q?: string;
  categoryId?: string;
  featured?: boolean;
};

export function filterDemoProducts(filters: DemoCatalogFilters): SerializedCatalogProduct[] {
  const q = filters.q?.trim().toLowerCase() ?? "";
  return serializedDemoProducts.filter((p) => {
    if (filters.featured && !p.isFeatured) return false;
    if (filters.categoryId && p.category.id !== filters.categoryId) return false;
    if (q) {
      const hay = `${p.name} ${p.sku} ${p.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function sortDemoProducts(items: SerializedCatalogProduct[]) {
  return [...items].sort((a, b) => {
    if (a.isFeatured !== b.isFeatured) return a.isFeatured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function getDemoProductBySlug(slug: string): SerializedCatalogProduct | undefined {
  const raw = DEMO_PRODUCTS.find((p) => p.slug === slug);
  return raw ? serializeDemoProduct(raw) : undefined;
}

export function sliceDemoPage<T>(items: T[], page: number, pageSize: number) {
  const total = items.length;
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return { total, slice };
}
