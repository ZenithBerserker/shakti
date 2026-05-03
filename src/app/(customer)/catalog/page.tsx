import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import {
  productInclude,
  serializeProduct,
  type SerializedCatalogProduct,
} from "@/lib/catalog";
import {
  listDemoCategoriesForCatalog,
  filterDemoProducts,
  sortDemoProducts,
} from "@/lib/demo-catalog";
import { storefrontData } from "@/lib/storefront-data";
import { ProductCard, type ProductCardModel } from "@/components/catalog/product-card";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function toCard(p: SerializedCatalogProduct): ProductCardModel {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    basePrice: p.basePrice,
    stockQuantity: p.stockQuantity,
    minOrderQty: p.minOrderQty,
    stepQty: p.stepQty,
    imageUrl: p.imageUrl,
    isFeatured: p.isFeatured,
    inStock: p.inStock,
    lowStock: p.lowStock,
    category: { name: p.category.name },
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const categoryId = typeof sp.categoryId === "string" ? sp.categoryId : "";
  const featured = sp.featured === "true";

  const { categories, serializedRows } = await storefrontData(
    async () => {
      const cats = await prisma.category.findMany({ orderBy: { name: "asc" } });
      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          ...(featured ? { isFeatured: true } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { sku: { contains: q, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
        take: 60,
        include: productInclude,
      });
      return {
        categories: cats,
        serializedRows: products.map(serializeProduct),
      };
    },
    () => ({
      categories: listDemoCategoriesForCatalog(),
      serializedRows: sortDemoProducts(
        filterDemoProducts({
          q,
          categoryId: categoryId || undefined,
          featured: featured || undefined,
        }),
      ).slice(0, 60),
    }),
  );

  const cards = serializedRows.map((p) => toCard(p));

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="space-y-1 md:space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Catalogue</h1>
        <p className="text-xs text-muted-foreground md:text-sm">
          Tap + on mobile to add MOQ · Filters below
        </p>
      </div>

      <form className="grid gap-3 md:grid-cols-[1fr_auto_auto]" action="/catalog" method="get">
        <Input name="q" defaultValue={q} placeholder="Search name or SKU…" />
        {featured ? <input type="hidden" name="featured" value="true" /> : null}
        <select
          name="categoryId"
          defaultValue={categoryId}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          Apply
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Link
          href={featured ? "/catalog" : "/catalog?featured=true"}
          className={cn(
            buttonVariants({ variant: featured ? "default" : "outline", size: "sm" }),
          )}
        >
          Featured only
        </Link>
        <Link href="/catalog" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Clear filters
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-3">
        {cards.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>

      {cards.length === 0 ? (
        <p className="text-sm text-muted-foreground">No products match these filters.</p>
      ) : null}
    </div>
  );
}
