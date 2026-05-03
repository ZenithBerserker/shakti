import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { productInclude, serializeProduct } from "@/lib/catalog";
import { getDemoProductBySlug } from "@/lib/demo-catalog";
import { storefrontData } from "@/lib/storefront-data";
import { formatINR } from "@/lib/money";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { AddToCartControls } from "@/components/catalog/add-to-cart";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const p = await storefrontData(
    async () => {
      const raw = await prisma.product.findFirst({
        where: { slug, isActive: true },
        include: productInclude,
      });
      return raw ? serializeProduct(raw) : null;
    },
    () => getDemoProductBySlug(slug) ?? null,
  );
  if (!p) notFound();
  const price = Number(p.basePrice);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl border bg-muted">
        {p.imageUrl ? (
          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" priority />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image configured
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Link href={`/catalog?categoryId=${p.category.id}`} className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline">
            {p.category.name}
          </Link>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            {p.name}
          </h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">SKU {p.sku}</Badge>
            {p.hsnCode ? <Badge variant="outline">HSN {p.hsnCode}</Badge> : null}
            <Badge variant="outline">GST {p.gstRate}%</Badge>
            {!p.inStock ? (
              <Badge variant="destructive">Out of stock</Badge>
            ) : p.lowStock ? (
              <Badge variant="secondary">Low stock</Badge>
            ) : (
              <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">In stock</Badge>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-3xl font-semibold">{formatINR(price)}</div>
          <p className="text-sm text-muted-foreground">
            Unit price before GST. Checkout computes GST line-wise using active slabs.
          </p>
        </div>

        <Separator />

        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Volume pricing
          </h2>
          {p.pricingTiers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No additional tiers configured.</p>
          ) : (
            <ul className="grid gap-2 text-sm">
              {p.pricingTiers.map((t) => (
                <li
                  key={`${t.minQuantity}-${t.discountPrice}`}
                  className="flex items-center justify-between rounded-xl border px-3 py-2"
                >
                  <span>From {t.minQuantity}+ units</span>
                  <span className="font-semibold">{formatINR(Number(t.discountPrice))}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        <AddToCartControls
          productId={p.id}
          minQty={p.minOrderQty}
          stepQty={p.stepQty}
          stock={p.stockQuantity}
        />

        <Separator />

        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Description
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
            {p.description}
          </p>
        </div>

        <Link href="/catalog" className={cn(buttonVariants({ variant: "outline" }))}>
          Back to catalogue
        </Link>
      </div>
    </div>
  );
}
