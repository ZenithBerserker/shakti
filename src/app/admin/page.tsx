"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Boxes,
  Package,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/money";
import { cn } from "@/lib/utils";

const quickLinks = [
  {
    href: "/admin/orders",
    title: "Orders & delivery",
    description: "See who bought what, ship-to address, status, WhatsApp drafts.",
    icon: Truck,
  },
  {
    href: "/admin/products",
    title: "Products & stock",
    description: "Edit descriptions, hide items, mark out of stock in one tap.",
    icon: Package,
  },
  {
    href: "/admin/customers",
    title: "Customers",
    description: "Everyone who registered — business name and phone.",
    icon: Users,
  },
  {
    href: "/admin/inventory",
    title: "Low stock",
    description: "SKUs running low so you can reorder.",
    icon: Boxes,
  },
] as const;

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
      contactPerson: string | null;
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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          You sign in here with the <strong>admin email and password</strong> (set when the site was deployed). That
          login is only for your team — customers use the public shop with their mobile OTP. Everything below is
          point-and-click: no code required.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="group block">
              <Card className="h-full transition hover:border-primary/30 hover:shadow-md">
                <CardHeader className="space-y-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Icon className="h-5 w-5" />
                    <CardTitle className="text-base leading-tight">{item.title}</CardTitle>
                  </div>
                  <CardDescription className="text-xs leading-snug">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          );
        })}
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
                  Registered customers
                </CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{data.totalCustomers}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">All orders</CardTitle>
              </CardHeader>
              <CardContent className="text-3xl font-semibold">{data.totalOrders}</CardContent>
            </Card>
            <Card className={data.lowStockCount > 0 ? "border-amber-400/60 bg-amber-50/60" : ""}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Low-stock SKUs</CardTitle>
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
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  Recent orders
                </CardTitle>
                <CardDescription className="mt-1">
                  Buyer names come from their profile at checkout — tap an order for full delivery details.
                </CardDescription>
              </div>
              <Link className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="/admin/orders">
                View all orders
              </Link>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Who ordered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">
                        <Link
                          href={`/admin/orders/${o.id}`}
                          className={cn(
                            "font-semibold text-primary underline-offset-2 hover:underline",
                          )}
                        >
                          {o.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium">{o.businessName ?? o.contactPerson ?? "Customer"}</div>
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
