"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/money";

export default function AdminOrderInspectPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [payload, setPayload] = useState<{
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
        unitPricePaid: string;
        gstAmountPaid: string;
        totalPrice: string;
      }[];
    };
    customer: Record<string, unknown>;
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch(`/api/admin/orders/${id}`, {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      setPayload(await res.json());
    })();
  }, [id]);

  if (!payload) return <p className="text-sm text-muted-foreground">Loading…</p>;

  const o = payload.order;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link href="/admin/orders" className="text-sm underline">
            ← Back to orders
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight">{o.orderNumber}</h1>
          <Badge>{o.status}</Badge>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          Grand total{" "}
          <div className="text-2xl font-semibold text-foreground">
            {formatINR(Number(o.grandTotal))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Phone" value={String(payload.customer.phone ?? "")} />
            <Row label="Business" value={String(payload.customer.businessName ?? "")} />
            <Row label="GSTIN" value={String(payload.customer.gstin ?? "")} />
          </CardContent>
        </Card>

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
          <CardTitle>Immutable line snapshots</CardTitle>
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
                  <div className="text-[11px] text-muted-foreground">
                    Unit pre-GST {formatINR(Number(it.unitPricePaid))} • GST{" "}
                    {formatINR(Number(it.gstAmountPaid))}
                  </div>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "—"}</span>
    </div>
  );
}
