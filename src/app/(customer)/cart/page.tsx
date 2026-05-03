"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/money";

type CartRow = {
  productId: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  quantity: number;
  stockQuantity: number;
  minOrderQty: number;
  stepQty: number;
  unitPricePreGst: string;
  lineTotal: string;
  validationError: string | null;
};

export default function CartPage() {
  const [busyId, setBusyId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<{
    items: CartRow[];
    subTotal: string;
    totalGst: string;
    shipping: string;
    grandTotal: string;
    hasBlockingErrors: boolean;
  } | null>(null);

  async function refresh() {
    const res = await fetch("/api/customer/cart", { credentials: "include", cache: "no-store" });
    if (!res.ok) {
      setSnapshot(null);
      return;
    }
    const data = await res.json();
    setSnapshot(data);
  }

  useEffect(() => {
    void refresh();
    const handler = () => void refresh();
    window.addEventListener("cart:updated", handler);
    return () => window.removeEventListener("cart:updated", handler);
  }, []);

  async function setQty(productId: string, quantity: number) {
    setBusyId(productId);
    try {
      const res = await fetch("/api/customer/cart/items", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not update cart");
      toast.success("Cart updated");
      window.dispatchEvent(new Event("cart:updated"));
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update cart");
    } finally {
      setBusyId(null);
    }
  }

  function clampQty(row: CartRow, next: number) {
    if (next <= 0) return 0;
    if (next < row.minOrderQty) return row.minOrderQty;
    const excess = next - row.minOrderQty;
    const stepped =
      row.minOrderQty + Math.floor(excess / row.stepQty) * row.stepQty;
    return Math.min(stepped, row.stockQuantity);
  }

  if (!snapshot) {
    return <p className="text-sm text-muted-foreground">Loading cart…</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Cart</h1>
          <p className="text-sm text-muted-foreground">
            Quantities honour MOQ + carton/step increments before checkout.
          </p>
        </div>

        {snapshot.items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Your cart is empty</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/catalog" className={cn(buttonVariants({}))}>
                Browse catalogue
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {snapshot.items.map((row) => (
              <Card key={row.productId} className="overflow-hidden">
                <CardContent className="flex gap-4 p-4">
                  <Link href={`/product/${row.slug}`} className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-muted">
                    {row.imageUrl ? (
                      <Image src={row.imageUrl} alt={row.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[11px] text-muted-foreground">
                        No image
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${row.slug}`}
                          className="line-clamp-2 font-semibold hover:underline"
                        >
                          {row.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          Unit pre-GST {formatINR(Number(row.unitPricePreGst))}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {formatINR(Number(row.lineTotal))}
                        </div>
                        <div className="text-[11px] text-muted-foreground">incl. GST line</div>
                      </div>
                    </div>

                    {row.validationError ? (
                      <p className="text-xs font-medium text-destructive">{row.validationError}</p>
                    ) : null}

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center rounded-full border bg-background px-1 py-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full"
                          disabled={busyId === row.productId || row.quantity <= row.minOrderQty}
                          onClick={() =>
                            void setQty(row.productId, clampQty(row, row.quantity - row.stepQty))
                          }
                        >
                          −
                        </Button>
                        <span className="min-w-[3rem] text-center text-sm font-semibold">
                          {row.quantity}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full"
                          disabled={busyId === row.productId || row.quantity >= row.stockQuantity}
                          onClick={() =>
                            void setQty(row.productId, clampQty(row, row.quantity + row.stepQty))
                          }
                        >
                          +
                        </Button>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === row.productId}
                        onClick={() => void setQty(row.productId, 0)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Card className="sticky top-24">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal (pre-GST)</span>
              <span className="font-medium">{formatINR(Number(snapshot.subTotal))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST</span>
              <span className="font-medium">{formatINR(Number(snapshot.totalGst))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium">{formatINR(Number(snapshot.shipping))}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-base font-semibold">
              <span>Grand total</span>
              <span>{formatINR(Number(snapshot.grandTotal))}</span>
            </div>

            {snapshot.items.length === 0 || snapshot.hasBlockingErrors ? (
              <Button className="mt-2 w-full rounded-2xl" disabled>
                Proceed to checkout
              </Button>
            ) : (
              <Link
                href="/checkout"
                className={cn(buttonVariants({}), "mt-2 inline-flex w-full rounded-2xl")}
              >
                Proceed to checkout
              </Link>
            )}

            {snapshot.hasBlockingErrors ? (
              <p className="text-xs text-destructive">
                Resolve quantity/stock issues before checkout.
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
