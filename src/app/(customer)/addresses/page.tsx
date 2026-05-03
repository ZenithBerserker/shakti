"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type Address = {
  id: string;
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export default function AddressesPage() {
  const [rows, setRows] = useState<Address[]>([]);
  const [open, setOpen] = useState(false);

  const emptyForm = useMemo(
    () => ({
      title: "",
      streetAddress: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  async function refresh() {
    const res = await fetch("/api/customer/addresses", {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return;
    setRows(await res.json());
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function createAddress() {
    try {
      const res = await fetch("/api/customer/addresses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save address");
      toast.success("Address saved");
      setOpen(false);
      setForm(emptyForm);
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save address");
    }
  }

  async function remove(id: string) {
    try {
      const res = await fetch(`/api/customer/addresses/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not delete");
      toast.success("Address removed");
      await refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Addresses</h1>
          <p className="text-sm text-muted-foreground">
            Maintain dispatch-ready locations across branches or warehouses.
          </p>
        </div>

        <Button className="rounded-2xl" type="button" onClick={() => setOpen(true)}>
          Add address
        </Button>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New delivery location</DialogTitle>
            </DialogHeader>

            <div className="grid gap-3 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Site title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
                  placeholder="HQ Bengaluru"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="street">Street address</Label>
                <Input
                  id="street"
                  value={form.streetAddress}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, streetAddress: e.target.value }))
                  }
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm((s) => ({ ...s, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm((s) => ({ ...s, state: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pin">PIN code</Label>
                <Input
                  id="pin"
                  inputMode="numeric"
                  value={form.pincode}
                  onChange={(e) => setForm((s) => ({ ...s, pincode: e.target.value }))}
                  placeholder="560001"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isDefault}
                  onCheckedChange={(v) =>
                    setForm((s) => ({ ...s, isDefault: Boolean(v) }))
                  }
                />
                Set as default ship-to
              </label>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => void createAddress()}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {rows.map((a) => (
          <Card key={a.id} className="border-border/70">
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <div>
                <CardTitle className="text-lg">{a.title}</CardTitle>
                {a.isDefault ? (
                  <p className="text-xs font-semibold text-primary">Default</p>
                ) : null}
              </div>
              <Button variant="outline" size="sm" onClick={() => void remove(a.id)}>
                Delete
              </Button>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <div className="whitespace-pre-wrap">{a.streetAddress}</div>
              <div>
                {a.city}, {a.state} — {a.pincode}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No addresses saved yet — add your first warehouse or regional office.
        </p>
      ) : null}
    </div>
  );
}
