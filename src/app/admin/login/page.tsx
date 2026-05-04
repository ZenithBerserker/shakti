"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      toast.success("Welcome back");
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-muted/40 px-4 py-16">
      <Card className="w-full max-w-md border-border/70 shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Staff login</CardTitle>
          <p className="text-sm text-muted-foreground">
            This screen is only for your operations team (you). Customers never see it — they sign in on the public shop
            with their mobile OTP. Use the admin email and password created for you when the site was set up.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button className="w-full rounded-2xl" disabled={busy} onClick={() => void submit()}>
            Continue
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No database yet?{" "}
            <Link href="/admin/demo" className="font-medium text-foreground underline underline-offset-4">
              Open dashboard preview (demo data)
            </Link>
          </p>
          <div className="space-y-2 text-center text-xs text-muted-foreground">
            <p>
              Default after <code className="rounded bg-muted px-1">npm run db:seed</code>:{" "}
              <code className="rounded bg-muted px-1">admin@cleaningb2b.demo</code> /{" "}
              <code className="rounded bg-muted px-1">Admin@12345</code>
            </p>
            <p>
              Still failing? Run locally:{" "}
              <code className="rounded bg-muted px-1">
                npm run admin:create -- you@company.com YourPassword123
              </code>
            </p>
            <p>
              Forgot password? Ask whoever maintains hosting — or reset with{" "}
              <code className="rounded bg-muted px-1">admin:create</code> against production DATABASE_URL.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
