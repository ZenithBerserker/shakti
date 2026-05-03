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

type Row = {
  id: string;
  name: string;
  sku: string;
  stockQuantity: number;
  basePrice: string;
  isFeatured: boolean;
  inStock: boolean;
};

export default function AdminInventoryPage() {
  const [threshold, setThreshold] = useState<number>(0);
  const [rows, setRows] = useState<Row[]>([]);

  async function refresh() {
    const res = await fetch("/api/admin/inventory/low-stock", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      toast.error("Could not load low-stock report");
      return;
    }
    const data = await res.json();
    setThreshold(Number(data.threshold ?? 0));
    setRows(data.items ?? []);
  }

  useEffect(() => {
    void refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Low stock</h1>
        <p className="text-sm text-muted-foreground">
          SKUs above zero but below the replenishment threshold ({threshold} units). Tune via{" "}
          <code className="rounded bg-muted px-1">NEXT_PUBLIC_LOW_STOCK_THRESHOLD</code>.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle>Replenishment queue</CardTitle>
          <Button variant="secondary" onClick={() => void refresh()}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">On hand</TableHead>
                <TableHead className="text-right">List price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.sku}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={r.inStock ? "secondary" : "destructive"}>{r.stockQuantity}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatINR(Number(r.basePrice))}</TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/products/${r.id}/edit`}
                      className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                    >
                      Adjust stock
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No SKUs are currently in the low-stock band — great job!
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
