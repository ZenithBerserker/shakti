import Image from "next/image";
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
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

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

  const heroImage =
    "https://images.unsplash.com/photo-1507652313519-d4c917358e32?auto=format&fit=crop&w=1400&q=85";

  return (
    <div className="space-y-8 pb-4 md:space-y-10 md:pb-0">
      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-primary/15 shadow-md">
          <div className="relative aspect-[5/3] w-full min-h-[168px] sm:aspect-[2.1/1]">
            <Image
              src={heroImage}
              alt="Cleaning liquids, sprays, sponges and cloths on a counter"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 420px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 space-y-2 p-4">
              <p className="inline-flex w-fit rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                B2B reorder app
              </p>
              <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground drop-shadow-sm">
                Liquids, mops & soaps — MOQ-aware, GST-ready.
              </h1>
            </div>
          </div>
        </div>

        <p className="text-pretty text-sm text-muted-foreground">
          Tap <span className="font-medium text-foreground">+</span> on a card to add your minimum order qty.
          Sign in with OTP to save carts and ship-to addresses.
        </p>
        <div className="flex flex-wrap gap-2">
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
