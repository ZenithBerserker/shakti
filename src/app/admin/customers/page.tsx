"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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

type Row = {
  id: string;
  phone: string;
  businessName: string | null;
  contactPerson: string | null;
  email: string | null;
  gstin: string | null;
  businessType: string | null;
  orders: number;
};

export default function AdminCustomersPage() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[]>([]);

  async function refresh() {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    params.set("pageSize", "80");

    const res = await fetch(`/api/admin/customers?${params.toString()}`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) {
      toast.error("Could not load customers");
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
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Customers</h1>
        <p className="text-sm text-muted-foreground">
          Unified buyer profiles pulled from Firebase-backed onboarding.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <CardTitle>Directory</CardTitle>
          <div className="flex w-full max-w-xl gap-2 md:w-auto">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search phone, GSTIN…" />
            <Button variant="secondary" onClick={() => void refresh()}>
              Search
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>GSTIN</TableHead>
                <TableHead className="text-right">Orders</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.businessName ?? "—"}</TableCell>
                  <TableCell className="text-sm">
                    <div>{r.phone}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{r.gstin ?? "—"}</TableCell>
                  <TableCell className="text-right">{r.orders}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    No customers yet.
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
