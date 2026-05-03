"use client";

import { useRouter } from "next/navigation";
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

export default function RegisterPage() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [businessType, setBusinessType] = useState<string>("");

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/customer/me", { credentials: "include" });
      if (!res.ok) {
        router.replace("/login");
        return;
      }
      const me = await res.json().catch(() => null);
      if (me?.profileComplete) router.replace("/catalog");
      if (me) {
        setBusinessName(me.businessName ?? "");
        setContactPerson(me.contactPerson ?? "");
        setEmail(me.email ?? "");
        setGstin(me.gstin ?? "");
        setBusinessType(me.businessType ?? "");
      }
    })();
  }, [router]);

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
      toast.success("Profile saved");
      router.replace("/catalog");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-border/70 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Complete business registration</CardTitle>
          <p className="text-sm text-muted-foreground">
            Capture GSTIN and operational contacts so invoices remain compliant for ITC workflows.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="biz">Business / billing name</Label>
            <Input
              id="biz"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g., Orion Hospitality Pvt Ltd"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact person</Label>
            <Input
              id="contact"
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Procurement manager name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.in"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="gstin">GSTIN</Label>
            <Input
              id="gstin"
              value={gstin}
              onChange={(e) => setGstin(e.target.value.toUpperCase())}
              placeholder="27AAAAA0000A1Z5"
              className="font-mono tracking-wide"
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
            <Button className="w-full rounded-2xl" disabled={busy} onClick={() => void submit()}>
              Save & continue to catalogue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
