"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BUSINESS_TYPES = [
  "Hotel",
  "Hospital",
  "Facility Management",
  "Retail",
  "Manufacturing",
  "Education",
  "Corporate Office",
  "Other",
] as const;

export default function ProfilePage() {
  const [busy, setBusy] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/customer/me", { credentials: "include" });
      if (!res.ok) return;
      const me = await res.json();
      setBusinessName(me.businessName ?? "");
      setContactPerson(me.contactPerson ?? "");
      setEmail(me.email ?? "");
      setGstin(me.gstin ?? "");
      setBusinessType(me.businessType ?? "");
      setPhone(me.phone ?? "");
    })();
  }, []);

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          contactPerson,
          email,
          gstin,
          businessType,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save profile");
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Keep procurement contacts accurate — invoices pull these identifiers.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business identity</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label>Verified mobile</Label>
            <Input value={phone} disabled />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="biz">Legal / billing name</Label>
            <Input id="biz" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact person</Label>
            <Input
              id="contact"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input
              id="gstin"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              className="font-mono"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Business type</Label>
            <Select
              value={businessType || undefined}
              onValueChange={(v) => setBusinessType(v ?? "")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select vertical" />
              </SelectTrigger>
              <SelectContent>
                {BUSINESS_TYPES.map((bt) => (
                  <SelectItem key={bt} value={bt}>
                    {bt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="md:col-span-2">
            <Button disabled={busy} className="rounded-2xl" onClick={() => void submit()}>
              Save changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
