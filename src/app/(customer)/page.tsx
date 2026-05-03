import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import {
  productInclude,
  serializeProduct,
  type SerializedCatalogProduct,
} from "@/lib/catalog";
import {
  listDemoCategoriesWithCounts,
  filterDemoProducts,
  sortDemoProducts,
} from "@/lib/demo-catalog";
import { storefrontData } from "@/lib/storefront-data";
import { ProductCard, type ProductCardModel } from "@/components/catalog/product-card";
import { RecentForYou } from "@/components/catalog/recent-for-you";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export default async function HomePage() {
  const { featuredSerialized, categories } = await storefrontData(
    async () => {
      const [featured, cats] = await Promise.all([
        prisma.product.findMany({
          where: { isActive: true, isFeatured: true },
          orderBy: { updatedAt: "desc" },
          take: 8,
          include: productInclude,
        }),
        prisma.category.findMany({
          orderBy: { name: "asc" },
          take: 8,
          include: { _count: { select: { products: true } } },
        }),
      ]);
      return {
        featuredSerialized: featured.map(serializeProduct),
        categories: cats,
      };
    },
    () => ({
      featuredSerialized: sortDemoProducts(filterDemoProducts({ featured: true })).slice(0, 8),
      categories: listDemoCategoriesWithCounts().slice(0, 8),
    }),
  );

  const cards = featuredSerialized.map((p) => toCard(p));

  return (
    <div className="space-y-8 pb-4 md:space-y-12 md:pb-0">
      <section className="grid gap-6 md:grid-cols-2 md:items-center md:gap-8">
        <div className="space-y-4 md:space-y-5">
          <p className="inline-flex rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-secondary-foreground md:text-xs">
            Made for Indian B2B teams
          </p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-5xl">
            Bulk cleaning supplies with MOQ-aware pricing and GST-ready orders.
          </h1>
          <p className="text-pretty text-sm text-muted-foreground md:text-base md:text-lg">
            Tap <span className="font-medium text-foreground">+</span> on featured SKUs to add your MOQ
            instantly — save addresses, track dispatch, reorder in seconds.
          </p>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link
              href="/catalog"
              className={cn(buttonVariants({ size: "lg" }), "min-h-11 flex-1 rounded-2xl sm:flex-none")}
            >
              Browse catalogue
            </Link>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "min-h-11 flex-1 rounded-2xl sm:flex-none",
              )}
            >
              Sign in with OTP
            </Link>
          </div>
        </div>
        <Card className="hidden border-border/70 shadow-sm md:block">
          <CardHeader>
            <CardTitle className="text-lg">Quick facts</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm text-muted-foreground">
            <div className="flex items-center justify-between border-b pb-3">
              <span>Mobile-first checkout</span>
              <span className="font-medium text-foreground">Sub-2s routing</span>
            </div>
            <div className="flex items-center justify-between border-b pb-3">
              <span>WhatsApp coordination</span>
              <span className="font-medium text-foreground">One-tap share</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Admin control</span>
              <span className="font-medium text-foreground">Live order board</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4 md:space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Featured picks</h2>
            <p className="text-xs text-muted-foreground md:text-sm">
              Swipe on mobile · Tap + to add MOQ to cart
            </p>
          </div>
          <Link
            href="/catalog?featured=true"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-9 shrink-0 px-3 md:h-10")}
          >
            View all
          </Link>
        </div>
        <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:mx-0 md:grid md:snap-none md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-3 [&::-webkit-scrollbar]:hidden">
          {cards.map((p) => (
            <div
              key={p.id}
              className="w-[min(86vw,320px)] shrink-0 snap-center md:w-auto md:snap-none"
            >
              <ProductCard p={p} />
            </div>
          ))}
          {cards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No featured products yet.</p>
          ) : null}
        </div>
      </section>

      <RecentForYou />

      <section className="space-y-4 md:space-y-5">
        <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Categories</h2>
        <div className="grid grid-cols-2 gap-2 md:gap-3 lg:grid-cols-3">
          {categories.map((c) => (
            <Link key={c.id} href={`/catalog?categoryId=${c.id}`}>
              <Card className="rounded-2xl transition active:scale-[0.98] md:rounded-xl md:hover:shadow-md">
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="text-sm leading-tight md:text-base">{c.name}</CardTitle>
                  <p className="text-[11px] text-muted-foreground md:text-sm">
                    {c._count.products} SKUs
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
