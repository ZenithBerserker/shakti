"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { formatINR } from "@/lib/money";

type Address = {
  id: string;
  title: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [cart, setCart] = useState<{
    grandTotal: string;
    items: { quantity: number }[];
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void (async () => {
      const [addrRes, cartRes] = await Promise.all([
        fetch("/api/customer/addresses", { credentials: "include", cache: "no-store" }),
        fetch("/api/customer/cart", { credentials: "include", cache: "no-store" }),
      ]);

      if (addrRes.ok) {
        const rows = (await addrRes.json()) as Address[];
        setAddresses(rows);
        const def = rows.find((a) => a.isDefault)?.id ?? rows[0]?.id ?? "";
        setAddressId(def);
      }

      if (cartRes.ok) {
        const c = await cartRes.json();
        setCart(c);
      }
    })();
  }, []);

  const canSubmit = useMemo(() => {
    return Boolean(addressId) && Boolean(cart?.items?.length);
  }, [addressId, cart]);

  async function placeOrder() {
    setBusy(true);
    try {
      const res = await fetch("/api/customer/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId,
          customerNotes: notes.trim().length ? notes.trim() : undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      sessionStorage.setItem(
        "lastCheckout",
        JSON.stringify({
          order: data.order,
          whatsappNotifyUrl: data.whatsappNotifyUrl ?? null,
        }),
      );

      toast.success("Order placed");
      window.dispatchEvent(new Event("cart:updated"));
      router.replace("/checkout/success");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Checkout</h1>
          <p className="text-sm text-muted-foreground">
            Pick a ship-to location captured during onboarding. Add gate/security notes for smoother deliveries.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle>Delivery address</CardTitle>
            <Link
              href="/addresses"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Manage addresses
            </Link>
          </CardHeader>
          <CardContent className="grid gap-3">
            {addresses.length === 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t saved any addresses yet.
                </p>
                <Link href="/addresses" className={cn(buttonVariants({}))}>
                  Add address
                </Link>
              </div>
            ) : (
              addresses.map((a) => (
                <label
                  key={a.id}
                  className={`cursor-pointer rounded-2xl border p-4 transition hover:bg-muted/40 ${
                    addressId === a.id ? "border-primary ring-2 ring-ring/40" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <input
                      type="radio"
                      name="address"
                      checked={addressId === a.id}
                      onChange={() => setAddressId(a.id)}
                      className="mt-1"
                    />
                    <div className="space-y-1 text-sm">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{a.title}</span>
                        {a.isDefault ? (
                          <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold">
                            Default
                          </span>
                        ) : null}
                      </div>
                      <div className="text-muted-foreground">
                        {a.streetAddress}
                        <br />
                        {a.city}, {a.state} — {a.pincode}
                      </div>
                    </div>
                  </div>
                </label>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delivery notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="notes">Instructions for dispatch team</Label>
            <Textarea
              id="notes"
              placeholder="Gate codes, unloading bays, PO references…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            {cart?.items?.length ? `${cart.items.length} SKU lines` : "Cart empty"}
          </div>
          <Separator />
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Payable</span>
            <span>{formatINR(Number(cart?.grandTotal ?? "0"))}</span>
          </div>

          <Button
            className="w-full rounded-2xl"
            disabled={!canSubmit || busy}
            onClick={() => void placeOrder()}
          >
            Place order
          </Button>

          <Link
            href="/cart"
            className={cn(buttonVariants({ variant: "outline" }), "w-full rounded-2xl")}
          >
            Review cart
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
