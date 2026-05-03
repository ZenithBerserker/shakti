"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Maintain SKU economics, imagery, and replenishment posture.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className={cn(buttonVariants({}), "rounded-2xl")}
        >
          New product
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Catalogue search</CardTitle>
          <div className="flex w-full max-w-xl gap-2 md:w-auto">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SKU / name…" />
            <Button variant="secondary" onClick={() => void refresh()}>
              Search
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">Flags</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                  <TableCell className="text-right">{formatINR(Number(r.basePrice))}</TableCell>
                  <TableCell className="text-right">{r.stockQuantity}</TableCell>
                  <TableCell className="text-right space-x-2">
                    {r.isFeatured ? <Badge>Featured</Badge> : null}
                    {!r.isActive ? <Badge variant="destructive">Inactive</Badge> : null}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/products/${r.id}/edit`}
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    >
                      Edit
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-sm text-muted-foreground">
                    No SKUs loaded yet — seed the database or create manually.
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
