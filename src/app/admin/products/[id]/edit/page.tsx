"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      toast.success("Saved — changes appear on the shop right away.");
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
      toast.success("Archived — open Products and press Show, or Edit this SKU later.");
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
      toast.success("Photo uploaded");
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
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Everything here is safe for non-technical staff: write what shoppers should read, adjust stock, turn the
            listing off without deleting history.
          </p>
        </div>
        <Link href="/admin/products" className={cn(buttonVariants({ variant: "outline" }), "rounded-xl")}>
          Back to list
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What shoppers see</CardTitle>
          <CardDescription>Name, category, long description, and photo appear on the public product page.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="category">Shelf category</Label>
            <Select value={categoryId || undefined} onValueChange={(v) => setCategoryId(v ?? "")}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Choose category" />
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
            <Label htmlFor="name">Product title</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 5L neutral floor cleaner" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="desc">Description for buyers</Label>
            <Textarea
              id="desc"
              rows={10}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ingredients, dilution, pack size, safety notes…"
              className="min-h-[180px] resize-y"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="img">Picture link (optional)</Label>
            <Input id="img" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://…" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="file">Upload a photo</Label>
            <Input
              id="file"
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={(e) => void uploadImage(e.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">
              Needs Supabase storage configured on the server — otherwise paste an image URL above.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing &amp; references</CardTitle>
          <CardDescription>SKU is your internal code; GST % and HSN feed invoices.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU / internal code</Label>
            <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hsn">HSN code</Label>
            <Input id="hsn" value={hsnCode} onChange={(e) => setHsnCode(e.target.value)} placeholder="Optional" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price before GST (₹)</Label>
            <Input id="price" inputMode="decimal" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst">GST rate (%)</Label>
            <Input id="gst" inputMode="decimal" value={gstRate} onChange={(e) => setGstRate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Stock &amp; ordering rules</CardTitle>
          <CardDescription>
            Set quantity to <strong>0</strong> while you wait for supply; shoppers cannot checkout until stock is above
            zero.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="stock">Units in warehouse</Label>
            <Input id="stock" inputMode="numeric" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moq">Minimum order quantity</Label>
            <Input id="moq" inputMode="numeric" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="step">Sell in multiples of (step qty)</Label>
            <Input id="step" inputMode="numeric" value={stepQty} onChange={(e) => setStepQty(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shop visibility</CardTitle>
          <CardDescription>Turn listings off seasonally without deleting anything.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-muted/30 p-4 text-sm">
            <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(Boolean(v))} className="mt-0.5" />
            <span>
              <span className="font-medium">Show on the public website</span>
              <span className="mt-1 block text-xs text-muted-foreground">
                Uncheck to hide the product completely; past orders stay unchanged.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/80 bg-muted/30 p-4 text-sm">
            <Checkbox checked={isFeatured} onCheckedChange={(v) => setIsFeatured(Boolean(v))} className="mt-0.5" />
            <span>
              <span className="font-medium">Feature on homepage highlights</span>
              <span className="mt-1 block text-xs text-muted-foreground">Optional spotlight in the storefront.</span>
            </span>
          </label>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button className="rounded-2xl px-8" disabled={busy} onClick={() => void save()}>
          Save changes
        </Button>
        <Button variant="destructive" disabled={busy} className="rounded-2xl" onClick={() => void deactivate()}>
          Hide product from shop (soft archive)
        </Button>
      </div>
    </div>
  );
}
