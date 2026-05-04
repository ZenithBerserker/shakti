"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DISPATCH_WHATSAPP_E164 } from "@/lib/constants";
import { whatsappOpsNewOrderDeepLink } from "@/lib/whatsapp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatINR } from "@/lib/money";

const STATUSES = ["PENDING", "PACKED", "DISPATCHED", "DELIVERED", "CANCELLED"] as const;

type Row = {
  id: string;
  orderNumber: string;
  status: string;
  grandTotal: string;
  customerPhone: string;
  businessName: string | null;
  createdAt: string;
  deliveryName: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
};

export default function AdminOrdersPage() {
  const [status, setStatus] = useState<string>("ALL");
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  const exportHref = useMemo(() => {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    return `/api/admin/orders/export?${params.toString()}`;
  }, [status, q, from, to]);

  async function refresh() {
    const params = new URLSearchParams();
    if (status !== "ALL") params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("pageSize", "50");

    const res = await fetch(`/api/admin/orders?${params.toString()}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      toast.error("Could not load orders");
      return;
    }
    const data = await res.json();
    setRows(data.items ?? []);
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function patchStatus(id: string, next: string) {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not update status");
      toast.success("Order updated");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update status");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Orders</h1>
          <p className="text-sm text-muted-foreground">
            Fulfillment queue with delivery snapshots — open WhatsApp drafts for dispatch runs when a dispatch number is configured.
          </p>
        </div>
        <a href={exportHref} className={cn(buttonVariants({ variant: "outline" }))}>
          Export CSV
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input placeholder="Search order / phone / business" value={q} onChange={(e) => setQ(e.target.value)} />
          <Select value={status} onValueChange={(v) => setStatus(v ?? "ALL")}>
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          <Button onClick={() => void refresh()} variant="secondary">
            Apply
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="min-w-[200px]">Deliver to</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                {DISPATCH_WHATSAPP_E164 ? <TableHead className="w-[100px]">Notify</TableHead> : null}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-mono text-xs">{o.orderNumber}</TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium">{o.businessName ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium leading-snug">{o.deliveryName}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.deliveryCity}, {o.deliveryState} {o.deliveryPincode}
                    </div>
                    <div className="line-clamp-2 text-[11px] text-muted-foreground">{o.deliveryAddress}</div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="min-w-[160px]">
                    <Select
                      value={o.status}
                      onValueChange={(v) => {
                        if (v) void patchStatus(o.id, v);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <div>{formatINR(Number(o.grandTotal))}</div>
                    <Link className="text-xs underline" href={`/admin/orders/${o.id}`}>
                      Inspect
                    </Link>
                  </TableCell>
                  {DISPATCH_WHATSAPP_E164 ? (
                    <TableCell>
                      <a
                        href={whatsappOpsNewOrderDeepLink({
                          phoneE164: DISPATCH_WHATSAPP_E164,
                          orderNumber: o.orderNumber,
                          grandTotal: o.grandTotal,
                          customerPhone: o.customerPhone,
                          deliveryName: o.deliveryName,
                          deliveryAddress: o.deliveryAddress,
                          deliveryCity: o.deliveryCity,
                          deliveryState: o.deliveryState,
                          deliveryPincode: o.deliveryPincode,
                        })}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "gap-1.5 whitespace-nowrap",
                        )}
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    </TableCell>
                  ) : null}
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={DISPATCH_WHATSAPP_E164 ? 7 : 6}
                    className="text-sm text-muted-foreground"
                  >
                    No orders match these filters.
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
