"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useStorefrontDemoCatalog } from "@/components/demo-catalog-context";

export function AddToCartControls(props: {
  productId: string;
  minQty: number;
  stepQty: number;
  stock: number;
}) {
  const demoCatalog = useStorefrontDemoCatalog();
  const initialQty = useMemo(
    () => Math.min(props.stock, props.minQty),
    [props.stock, props.minQty],
  );

  const [qty, setQty] = useState(initialQty);
  const [busy, setBusy] = useState(false);

  async function submit(nextQty: number) {
    if (demoCatalog) {
      toast.message("Demo catalogue", {
        description: "Cart and checkout need a connected database and sign-in.",
      });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/customer/cart/items", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: props.productId, quantity: nextQty }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not update cart");
      toast.success(nextQty === 0 ? "Removed from cart" : "Cart updated");
      window.dispatchEvent(new Event("cart:updated"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update cart");
    } finally {
      setBusy(false);
    }
  }

  function clampQty(next: number) {
    if (next < props.minQty) return props.minQty;
    const excess = next - props.minQty;
    const stepped =
      props.minQty + Math.floor(excess / props.stepQty) * props.stepQty;
    return Math.min(stepped, props.stock);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {demoCatalog ? (
        <p className="w-full rounded-xl border border-dashed bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          Demo mode: browsing only. Disable{" "}
          <code className="rounded bg-muted px-1">NEXT_PUBLIC_USE_MOCK_CATALOG</code> and connect
          Postgres to place orders.
        </p>
      ) : null}
      <div className="flex items-center rounded-full border bg-background px-1 py-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          disabled={demoCatalog || busy || qty <= props.minQty}
          onClick={() => setQty((q) => clampQty(q - props.stepQty))}
        >
          −
        </Button>
        <span className="min-w-[3rem] text-center text-sm font-semibold">{qty}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-full"
          disabled={demoCatalog || busy || qty >= props.stock}
          onClick={() => setQty((q) => clampQty(q + props.stepQty))}
        >
          +
        </Button>
      </div>
      <Button
        disabled={demoCatalog || busy || props.stock <= 0}
        onClick={() => void submit(qty)}
      >
        Add to cart
      </Button>
      <Button variant="outline" disabled={demoCatalog || busy} onClick={() => void submit(0)}>
        Remove
      </Button>
      <p className="text-xs text-muted-foreground">
        MOQ {props.minQty} • Step {props.stepQty}
      </p>
    </div>
  );
}
