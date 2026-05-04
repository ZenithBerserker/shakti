"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Package } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/money";

type Row = {
  id: string;
  name: string;
  sku: string;
  slug: string;
  basePrice: string;
  stockQuantity: number;
  isFeatured: boolean;
  isActive: boolean;
};

export default function AdminProductsPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function refresh() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("pageSize", "60");

    const res = await fetch(`/api/admin/products?${params.toString()}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      toast.error("Could not load products");
      return;
    }
    const data = await res.json();
    setRows(data.items ?? []);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function quickPatch(id: string, patch: Record<string, unknown>, okMsg: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Update failed");
      toast.success(okMsg);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Change descriptions and prices under <strong>Edit</strong>. Use the quick buttons for everyday tasks: hide a
            item from the shop, or mark it out of stock (stock goes to zero — open Edit when you receive more units).
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={cn(buttonVariants({}), "rounded-2xl")}
        >
          Add product
        </Link>
      </div>

      <Card className="border-muted">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tips</CardTitle>
          <CardDescription className="text-sm leading-relaxed">
            <strong>Hidden</strong> means shoppers cannot see or buy it (seasonal pause).{" "}
            <strong>Out of stock</strong> keeps it visible but blocks checkout until you raise stock again.
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Search catalogue</CardTitle>
          <div className="flex w-full max-w-xl gap-2 md:w-auto">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Product name or SKU…" />
            <Button variant="secondary" onClick={() => void refresh()}>
              Search
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead>Shop status</TableHead>
                <TableHead className="text-right">Quick fixes</TableHead>
                <TableHead className="text-right">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const loading = busyId === r.id;
                const out = r.stockQuantity <= 0;
                return (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{r.name}</div>
                          <div className="font-mono text-[11px] text-muted-foreground">{r.sku}</div>
                          {r.isFeatured ? (
                            <Badge variant="secondary" className="mt-1 text-[10px]">
                              Featured
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{formatINR(Number(r.basePrice))}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={out ? "destructive" : "outline"}>{out ? "Out of stock" : r.stockQuantity}</Badge>
                    </TableCell>
                    <TableCell>
                      {!r.isActive ? (
                        <Badge variant="destructive">Hidden from shop</Badge>
                      ) : (
                        <Badge variant="outline" className="border-emerald-600/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                          Visible
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {r.isActive ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 px-2 text-xs"
                            disabled={loading}
                            onClick={() =>
                              void quickPatch(
                                r.id,
                                { isActive: false },
                                "Hidden from shop — shoppers will not see it.",
                              )
                            }
                          >
                            <EyeOff className="h-3.5 w-3.5" />
                            Hide
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 px-2 text-xs"
                            disabled={loading}
                            onClick={() => void quickPatch(r.id, { isActive: true }, "Visible on shop again.")}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Show
                          </Button>
                        )}
                        {!out ? (
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            className="h-8 px-2 text-xs"
                            disabled={loading}
                            onClick={() =>
                              void quickPatch(r.id, { stockQuantity: 0 }, "Marked out of stock (quantity set to 0).")
                            }
                          >
                            Out of stock
                          </Button>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/products/${r.id}/edit`}
                        className={cn(buttonVariants({ size: "sm", variant: "default" }), "rounded-xl")}
                      >
                        Edit details
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    No products yet — add one or run the database seed.
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
