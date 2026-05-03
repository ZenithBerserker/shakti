"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/money";

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [data, setData] = useState<{
    order: {
      orderNumber: string;
      status: string;
      grandTotal: string;
      customerNotes?: string | null;
      deliveryName: string;
      deliveryAddress: string;
      deliveryCity: string;
      deliveryState: string;
      deliveryPincode: string;
      items: {
        productName: string;
        sku: string;
        quantity: number;
        totalPrice: string;
      }[];
    };
    customer: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/customer/orders/${id}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        toast.error("Could not load order");
        router.replace("/orders");
        return;
      }
      setData(await res.json());
    })();
  }, [id, router]);

  async function reorder() {
    try {
      const res = await fetch("/api/customer/orders/reorder", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error ?? "Reorder failed");
      toast.success("Cart rebuilt from this order");
      window.dispatchEvent(new Event("cart:updated"));
      router.push("/cart");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  }

  if (!data) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const o = data.order;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/orders"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">{o.orderNumber}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge>{o.status}</Badge>
          </div>
        </div>
        <Button className="rounded-2xl" onClick={() => void reorder()}>
          Reorder
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="font-semibold">{o.deliveryName}</div>
            <div className="text-muted-foreground whitespace-pre-wrap">{o.deliveryAddress}</div>
            <div className="text-muted-foreground">
              {o.deliveryCity}, {o.deliveryState} — {o.deliveryPincode}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Totals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Grand total</span>
              <span className="text-lg font-semibold">{formatINR(Number(o.grandTotal))}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {o.customerNotes ? (
        <Card>
          <CardHeader>
            <CardTitle>Delivery notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm whitespace-pre-wrap">{o.customerNotes}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Line items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {o.items.map((it) => (
            <div key={`${it.sku}-${it.quantity}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{it.productName}</div>
                  <div className="text-xs text-muted-foreground">SKU {it.sku}</div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">Qty {it.quantity}</div>
                  <div className="font-semibold">{formatINR(Number(it.totalPrice))}</div>
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
