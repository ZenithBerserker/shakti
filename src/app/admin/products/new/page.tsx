"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function AdminNewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Cat[]>([]);
  const [busy, setBusy] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [gstRate, setGstRate] = useState("18");
  const [hsnCode, setHsnCode] = useState("");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [minOrderQty, setMinOrderQty] = useState("1");
  const [stepQty, setStepQty] = useState("1");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/admin/categories", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      const rows = (await res.json()) as Cat[];
      setCategories(rows);
      if (rows[0]) setCategoryId(rows[0].id);
    })();
  }, []);

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
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
          pricingTiers: [],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not create product");
      toast.success("Product created");
      router.replace(`/admin/products/${data.id}/edit`);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create product");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">New product</h1>
          <p className="text-sm text-muted-foreground">
            Tier pricing can be layered after creation from the edit screen (via tier overrides API).
          </p>
        </div>
        <Link href="/admin/products" className={cn(buttonVariants({ variant: "outline" }))}>
          Cancel
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
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
            <Label htmlFor="price">Base price (pre-GST)</Label>
            <Input id="price" inputMode="decimal" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gst">GST %</Label>
            <Input id="gst" inputMode="decimal" value={gstRate} onChange={(e) => setGstRate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" inputMode="numeric" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="moq">MOQ</Label>
            <Input id="moq" inputMode="numeric" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="step">Step qty</Label>
            <Input id="step" inputMode="numeric" value={stepQty} onChange={(e) => setStepQty(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="img">Image URL (optional)</Label>
            <Input id="img" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." />
          </div>

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <Checkbox checked={isFeatured} onCheckedChange={(v) => setIsFeatured(Boolean(v))} />
            Featured SKU
          </label>

          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(Boolean(v))} />
            Active in catalogue
          </label>

          <div className="md:col-span-2">
            <Button className="rounded-2xl" disabled={busy} onClick={() => void submit()}>
              Create product
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
