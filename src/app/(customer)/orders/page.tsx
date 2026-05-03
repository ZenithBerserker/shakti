"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/money";

type OrderRow = {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: string;
  createdAt: string;
};

export default function OrdersPage() {
  const [items, setItems] = useState<OrderRow[]>([]);

  async function refresh() {
    const res = await fetch("/api/customer/orders?pageSize=50", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      toast.error("Could not load orders");
      return;
    }
    const data = await res.json();
    setItems(data.items ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function reorder(orderId: string) {
    try {
      const res = await fetch("/api/customer/orders/reorder", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Reorder failed");
      const warns = Array.isArray(data.warnings) ? (data.warnings as string[]) : [];
      toast.success(warns.length ? `Rebuilt cart (${warns.length} notes)` : "Cart rebuilt");
      if (warns.length) warns.forEach((w) => toast.message(w));
      window.dispatchEvent(new Event("cart:updated"));
      window.location.href = "/cart";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reorder failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track fulfilment milestones and rebuild carts from historical snapshots.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent purchases</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{o.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatINR(Number(o.grandTotal))}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link
                      href={`/orders/${o.id}`}
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    >
                      Details
                    </Link>
                    <Button size="sm" onClick={() => void reorder(o.id)}>
                      Reorder
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    No orders yet —{" "}
                    <Link className="underline" href="/catalog">
                      start a catalogue basket
                    </Link>
                    .
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
