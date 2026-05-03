"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Package,
  ShoppingCart,
  Tags,
  Users,
} from "lucide-react";
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
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tags },
  { href: "/admin/inventory", label: "Low stock", icon: Boxes },
];

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname.startsWith("/admin/login")) {
    return <>{children}</>;
  }

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
    router.replace("/admin/login");
    router.refresh();
  }

  const Nav = (
    <nav className="grid gap-1">
      {links.map((l) => {
        const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
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

  return (
    <div className="min-h-dvh bg-muted/40">
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 py-6">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-6 rounded-2xl border bg-sidebar p-4 text-sidebar-foreground shadow-sm">
            <div className="px-2 pb-3">
              <div className="text-sm font-semibold tracking-tight">Shakti Admin</div>
              <div className="text-xs text-muted-foreground">Operations cockpit</div>
            </div>
            <Separator className="mb-3 bg-sidebar-border" />
            {Nav}
            <Separator className="my-3 bg-sidebar-border" />
            <Button variant="outline" className="w-full justify-start gap-2" onClick={() => void logout()}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex items-center justify-between lg:hidden">
            <div className="text-sm font-semibold">Admin</div>
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="icon" />}>
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px]">
                <SheetHeader>
                  <SheetTitle>Navigate</SheetTitle>
                </SheetHeader>
                <div className="mt-6">{Nav}</div>
                <Separator className="my-4" />
                <Button className="w-full gap-2" variant="outline" onClick={() => void logout()}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </SheetContent>
            </Sheet>
          </div>

          <div className="rounded-3xl border bg-background p-4 shadow-sm md:p-8">{children}</div>
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-6 right-6 hidden lg:block">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-xs text-muted-foreground shadow-md">
          <LineChart className="h-4 w-4" />
          Live dashboard refreshes every ~28s for audio cues
        </div>
      </div>
    </div>
  );
}
