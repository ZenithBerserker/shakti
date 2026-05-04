"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Boxes,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Package,
  Sparkles,
  ShoppingCart,
  Tags,
  Users,
} from "lucide-react";
import { OrderAlertPoller } from "@/components/admin/order-alert-poller";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const links = [
  { href: "/admin/demo", label: "UI preview (demo)", icon: Sparkles },
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/inventory", label: "Low stock alerts", icon: Boxes },
];

type AdminMe = { name: string; email: string; role: string };

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<AdminMe | null>(null);
  const isDemoPreview = pathname.startsWith("/admin/demo");

  useEffect(() => {
    if (pathname.startsWith("/admin/login") || pathname.startsWith("/admin/demo")) return;
    void (async () => {
      const res = await fetch("/api/admin/auth/me", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) return;
      setMe((await res.json()) as AdminMe);
    })();
  }, [pathname]);

  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  async function logout() {
    if (isDemoPreview) {
      router.replace("/admin/login");
      return;
    }
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/admin/login");
    router.refresh();
  }

  const Nav = (
    <nav className="grid gap-1">
      {links.map((l) => {
        let active = pathname === l.href || pathname.startsWith(`${l.href}/`);
        if (l.href === "/admin" && pathname.startsWith("/admin/demo")) active = false;
        const Icon = l.icon;
        return (
          <Link key={l.href} href={l.href}>
            <span
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-4 w-4" />
              {l.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  const signedInLine = isDemoPreview ? (
    <div className="rounded-xl border border-amber-200/80 bg-amber-50/90 px-2.5 py-2 text-xs text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-50">
      <div className="font-semibold">Demo preview mode</div>
      <p className="mt-1.5 leading-snug text-[11px] opacity-90">
        Navigation uses the real admin URLs — other pages need staff login once the database is connected.
      </p>
      <Link
        href="/admin/login"
        className="mt-2 inline-block text-[11px] font-medium text-amber-900 underline underline-offset-2 dark:text-amber-100"
      >
        Go to staff login →
      </Link>
    </div>
  ) : me ? (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/30 px-2.5 py-2 text-xs">
      <div className="font-medium text-sidebar-foreground">Signed in</div>
      <div className="truncate text-muted-foreground" title={me.email}>
        {me.name}
      </div>
      <div className="truncate text-[11px] text-muted-foreground">{me.email}</div>
      <Badge variant="secondary" className="mt-1.5 text-[10px] font-normal">
        {me.role.replace(/_/g, " ")}
      </Badge>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Orders always show the buyer&apos;s registered business name and mobile number — use Customers to see details.
      </p>
    </div>
  ) : (
    <div className="px-2 pb-1 text-xs text-muted-foreground">Loading session…</div>
  );

  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 rounded-2xl border bg-sidebar p-4 text-sidebar-foreground shadow-sm">
            <div className="px-2 pb-3">
              <div className="text-sm font-semibold tracking-tight">Shakti Admin</div>
              <div className="text-xs text-muted-foreground">Manage orders & catalogue — no code needed.</div>
            </div>
            {signedInLine}
            <Separator className="mb-3 mt-3 bg-sidebar-border" />
            {Nav}
            <Separator className="my-3 bg-sidebar-border" />
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => void logout()}>
              <LogOut className="h-4 w-4" />
              {isDemoPreview ? "Exit preview" : "Sign out"}
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          {!isDemoPreview ? <OrderAlertPoller /> : null}
          <div className="flex items-center justify-between lg:hidden">
            <div className="min-w-0">
              <div className="text-sm font-semibold">Admin</div>
              {me ? (
                <div className="truncate text-xs text-muted-foreground">{me.name}</div>
              ) : null}
            </div>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Navigate</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{signedInLine}</div>
                <Separator className="my-4" />
                <div className="mt-2">{Nav}</div>
                <Separator className="my-4" />
                <Button className="w-full gap-2" variant="outline" onClick={() => void logout()}>
                  <LogOut className="h-4 w-4" />
                  {isDemoPreview ? "Exit preview" : "Sign out"}
                </Button>
              </SheetContent>
            </Sheet>
          </div>

          <div className="rounded-3xl border bg-background p-4 shadow-sm md:p-8">{children}</div>
        </div>
      </div>

      {!isDemoPreview ? (
        <div className="pointer-events-none fixed bottom-6 right-6 hidden lg:block">
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs text-muted-foreground shadow-md">
            <LineChart className="h-4 w-4" />
            New orders: browser chime (~28s poll) · optional SMS/webhook via env (see .env.example)
          </div>
        </div>
      ) : null}
    </div>
  );
}
