"use client";

import { useEffect, useState } from "react";
import { ProductCard, type ProductCardModel } from "@/components/catalog/product-card";
import { useStorefrontDemoCatalog } from "@/components/demo-catalog-context";

type ApiProduct = {
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

function toCard(p: ApiProduct): ProductCardModel {
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

export function RecentForYou() {
  const demoCatalog = useStorefrontDemoCatalog();
  const [items, setItems] = useState<ProductCardModel[]>([]);

  useEffect(() => {
    void (async () => {
      const url = demoCatalog
        ? "/api/products?featured=true&pageSize=6"
        : "/api/customer/recent-products";
      const res = await fetch(url, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = (await res.json()) as { items?: ApiProduct[] };
      setItems((data.items ?? []).map(toCard));
    })();
  }, [demoCatalog]);

  if (items.length === 0) return null;

  return (
    <section className="space-y-5 border-t pt-12">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          {demoCatalog ? "Popular picks" : "Recently ordered"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {demoCatalog
            ? "Featured SKUs from the demo catalogue — connect a database for personalised reorder shortcuts."
            : "Quick shortcuts based on your latest fulfilment history (signed-in buyers only)."}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-3">
        {items.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
