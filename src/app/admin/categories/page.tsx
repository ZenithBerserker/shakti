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
  name: string;
  slug: string;
  productCount: number;
};

export default function AdminCategoriesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [name, setName] = useState("");

  async function refresh() {
    const res = await fetch("/api/admin/categories", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return;
    setRows(await res.json());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function create() {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not create category");
      toast.success("Category created");
      setName("");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create category");
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not delete category");
      toast.success("Category deleted");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete category");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
        <p className="text-sm text-muted-foreground">
          Lightweight taxonomy powering catalogue navigation.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add category</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Safety Gear" />
          </div>
          <Button className="rounded-2xl" onClick={() => void create()} disabled={name.trim().length < 2}>
            Create
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing categories</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="font-mono text-xs">{r.slug}</TableCell>
                  <TableCell className="text-right">{r.productCount}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => void remove(r.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-sm text-muted-foreground">
                    No categories yet.
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
