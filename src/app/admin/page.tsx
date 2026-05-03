"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { OrderAlertPoller } from "@/components/admin/order-alert-poller";
import { Badge } from "@/components/ui/badge";
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

export default function AdminDashboardPage() {
  const [data, setData] = useState<{
    totalSales: string;
    totalCustomers: number;
    totalOrders: number;
    lowStockCount: number;
    recentOrders: {
      id: string;
      orderNumber: string;
      status: string;
      grandTotal: string;
      customerPhone: string;
      businessName: string | null;
      createdAt: string;
    }[];
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/dashboard", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      setData(await res.json());
    })();
  }, []);

  return (
    <div className="space-y-8">
      <OrderAlertPoller />

      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Pulse on dispatch backlog, GST-ready revenue, and replenishment pressure.
        </p>
      </div>

      {!data ? (
        <p className="text-sm text-muted-foreground">Loading insights…</p>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lifetime sales (ex-cancelled)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">
                {formatINR(Number(data.totalSales))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Customers onboarded
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{data.totalCustomers}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Orders logged
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{data.totalOrders}</CardContent>
            </Card>
            <Card className={data.lowStockCount > 0 ? "border-amber-400/60 bg-amber-50/60" : ""}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  SKUs below threshold
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="text-3xl font-semibold">{data.lowStockCount}</div>
                <Link className="text-sm underline" href="/admin/inventory">
                  Review
                </Link>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
              <CardTitle>Recent orders</CardTitle>
              <Link className="text-sm underline" href="/admin/orders">
                View all
              </Link>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium">{o.businessName ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{o.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatINR(Number(o.grandTotal))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
