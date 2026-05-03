"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { useStorefrontDemoCatalog } from "@/components/demo-catalog-context";
import { formatINR } from "@/lib/money";
export type ProductCardModel = {
  id: string;
  name: string;
  slug: string;
  basePrice: string;
  stockQuantity: number;
  minOrderQty: number;
  stepQty: number;
  imageUrl: string | null;
  isFeatured: boolean;
  inStock: boolean;
  lowStock: boolean;
  category: { name: string };
};

function QuickAddFab({
  productId,
  productName,
  minQty,
  stock,
  inStock,
}: {
  productId: string;
  productName: string;
  minQty: number;
  stock: number;
  inStock: boolean;
}) {
  const demo = useStorefrontDemoCatalog();
  const router = useRouter();
  const pathname = usePathname();
  const [busy, setBusy] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock || stock <= 0) return;

    if (demo) {
      toast.message("Demo catalogue", {
        description: "Connect a database and sign in to add items to cart.",
      });
      return;
    }

    const qty = Math.min(stock, minQty);
    setBusy(true);
    try {
      const res = await fetch("/api/customer/cart/items", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity: qty }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (res.status === 401) {
        toast.error("Sign in to add items to your cart.");
        router.push(`/login?next=${encodeURIComponent(pathname || "/")}`);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Could not add to cart");
      toast.success(`Added ${productName.split("—")[0]?.trim() ?? "item"} (${qty} pcs)`);
      window.dispatchEvent(new Event("cart:updated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add to cart");
    } finally {
      setBusy(false);
    }
  }

  const canAdd = inStock && stock > 0 && !busy;

  return (
    <Button
      type="button"
      size="icon"
      variant="default"
      disabled={!canAdd}
      className="absolute bottom-2 right-2 z-20 size-11 shrink-0 touch-manipulation rounded-full shadow-lg ring-2 ring-background md:bottom-3 md:right-3"
      aria-label={`Add ${productName} to cart`}
      onClick={handleClick}
    >
      <Plus className="size-5" strokeWidth={2.5} />
    </Button>
  );
}

export function ProductCard({ p }: { p: ProductCardModel }) {
  const price = Number(p.basePrice);

  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm transition-[box-shadow] active:bg-muted/30 md:rounded-xl md:shadow-none md:hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full bg-muted">
        <Link href={`/product/${p.slug}`} className="block size-full">
          {p.imageUrl ? (
            <Image
              src={p.imageUrl}
              alt={p.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 85vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No image
            </div>
          )}
          <div className="pointer-events-none absolute left-2 top-2 flex flex-wrap gap-1.5">
            {p.isFeatured ? (
              <Badge className="bg-primary text-[10px] text-primary-foreground shadow-sm md:text-xs">
                Featured
              </Badge>
            ) : null}
            {!p.inStock ? (
              <Badge variant="destructive" className="text-[10px] shadow-sm md:text-xs">
                Out of stock
              </Badge>
            ) : p.lowStock ? (
              <Badge variant="secondary" className="text-[10px] shadow-sm md:text-xs">
                Low stock
              </Badge>
            ) : null}
          </div>
        </Link>
        <QuickAddFab
          productId={p.id}
          productName={p.name}
          minQty={p.minOrderQty}
          stock={p.stockQuantity}
          inStock={p.inStock}
        />
      </div>

      <Link href={`/product/${p.slug}`} className="block">
        <CardHeader className="space-y-1 p-3 pb-2 md:p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground md:text-[11px]">
            {p.category.name}
          </p>
          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug md:text-base">{p.name}</h3>
        </CardHeader>
        <CardContent className="px-3 pb-2 pt-0 md:px-4">
          <p className="text-base font-semibold tabular-nums md:text-lg">{formatINR(price)}</p>
          <p className="text-[11px] text-muted-foreground md:text-xs">GST extra at checkout</p>
        </CardContent>
      </Link>

      <CardFooter className="hidden p-4 pt-0 md:flex">
        <Link
          href={`/product/${p.slug}`}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          View details
        </Link>
      </CardFooter>
    </Card>
  );
}
