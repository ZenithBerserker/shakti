"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type Cat = { id: string; name: string };

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [categories, setCategories] = useState<Cat[]>([]);
  const [busy, setBusy] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [gstRate, setGstRate] = useState("");
  const [hsnCode, setHsnCode] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [minOrderQty, setMinOrderQty] = useState("");
  const [stepQty, setStepQty] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    void (async () => {
      const [catsRes, prodRes] = await Promise.all([
        fetch("/api/admin/categories", { credentials: "include", cache: "no-store" }),
        fetch(`/api/admin/products/${id}`, { credentials: "include", cache: "no-store" }),
      ]);

      if (catsRes.ok) {
        const rows = (await catsRes.json()) as Cat[];
        setCategories(rows);
      }

      if (!prodRes.ok) {
        toast.error("Could not load product");
        router.replace("/admin/products");
        return;
      }

      const p = await prodRes.json();
      setCategoryId(p.category.id);
      setName(p.name);
      setSku(p.sku);
      setDescription(p.description);
      setBasePrice(String(p.basePrice));
      setGstRate(String(p.gstRate));
      setHsnCode(p.hsnCode ?? "");
      setStockQuantity(String(p.stockQuantity));
      setMinOrderQty(String(p.minOrderQty));
      setStepQty(String(p.stepQty));
      setImageUrl(p.imageUrl ?? "");
      setIsFeatured(Boolean(p.isFeatured));
      setIsActive(Boolean(p.isActive));
    })();
  }, [id, router]);

  async function save() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId,
          name,
          sku,
          description,
          basePrice: Number(basePrice),
          gstRate: Number(gstRate),
          hsnCode: hsnCode || null,
          stockQuantity: Number(stockQuantity),
          minOrderQty: Number(minOrderQty),
          stepQty: Number(stepQty),
          imageUrl: imageUrl || null,
          isFeatured,
          isActive,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save");
      toast.success("Product saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  async function deactivate() {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not deactivate");
      toast.success("Product deactivated");
      router.replace("/admin/products");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not deactivate");
    } finally {
      setBusy(false);
    }
  }

  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/admin/products/${id}/image`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      setImageUrl(String(data.imageUrl ?? ""));
      toast.success("Image uploaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Edit product</h1>
          <p className="text-sm text-muted-foreground">
            Updates propagate to catalogue reads instantly; historical orders remain immutable.
          </p>
        </div>
        <Link href="/admin/products" className={cn(buttonVariants({ variant: "outline" }))}>
          Back
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fields</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Category</Label>
            <Select
              value={categoryId || undefined}
              onValueChange={(v) => setCategoryId(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hsn">HSN</Label>
            <Input id="hsn" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Base price</Label>
            <Input id="price" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst">GST %</Label>
            <Input id="gst" value={gstRate} onChange={(e) => setGstRate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moq">MOQ</Label>
            <Input id="moq" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step">Step qty</Label>
            <Input id="step" value={stepQty} onChange={(e) => setStepQty(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="img">Image URL</Label>
            <Input id="img" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="file">Upload image (Supabase storage)</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={(e) => void uploadImage(e.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">
              Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + bucket{" "}
              <code className="rounded bg-muted px-1">product-images</code>.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <Checkbox checked={isFeatured} onCheckedChange={(v) => setIsFeatured(Boolean(v))} />
            Featured
          </label>

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(Boolean(v))} />
            Active
          </label>

          <div className="flex flex-wrap gap-3 md:col-span-2">
            <Button className="rounded-2xl" disabled={busy} onClick={() => void save()}>
              Save changes
            </Button>
            <Button variant="destructive" disabled={busy} onClick={() => void deactivate()}>
              Deactivate (soft delete)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
