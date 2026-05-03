"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  LayoutGrid,
  LogOut,
  Menu,
  PhoneCall,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { SUPPORT_WHATSAPP_E164 } from "@/lib/constants";
import { whatsappSupportDeepLink } from "@/lib/whatsapp";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

function useCartBadge() {
  const [count, setCount] = useState<number>(0);

  async function refresh() {
    try {
      const res = await fetch("/api/customer/cart", {
        credentials: "include",
        cache: "no-store",
      });
      if (!res.ok) {
        setCount(0);
        return;
      }
      const data = (await res.json()) as {
        items?: { quantity: number }[];
      };
      const qty =
        data.items?.reduce((acc, i) => acc + (i.quantity ?? 0), 0) ?? 0;
      setCount(qty);
    } catch {
      setCount(0);
    }
  }

  useEffect(() => {
    void refresh();
    const handler = () => void refresh();
    window.addEventListener("cart:updated", handler);
    window.addEventListener("focus", handler);
    return () => {
      window.removeEventListener("cart:updated", handler);
      window.removeEventListener("focus", handler);
    };
  }, []);

  return count;
}

export function ClientChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cartQty = useCartBadge();

  const minimal = pathname.startsWith("/login");

  const waHref = useMemo(() => {
    if (!SUPPORT_WHATSAPP_E164) return null;
    return whatsappSupportDeepLink(
      SUPPORT_WHATSAPP_E164,
      "Hi Shakti Supplies team — I need procurement support.",
    );
  }, []);

  async function logoutCustomer() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  }

  const nav = (
    <>
      <Link
        href="/"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Home
      </Link>
      <Link
        href="/catalog"
        className="text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        Catalogue
      </Link>
      {!minimal ? (
        <>
          <Link
            href="/orders"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Orders
          </Link>
          <Link
            href="/addresses"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Addresses
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
          >
            Profile
          </Link>
        </>
      ) : null}
    </>
  );

  return (
    <div className="min-h-dvh bg-background pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-10">
      <header className="sticky top-0 z-40 border-b bg-background/85 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 md:py-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-tight">
                  Shakti Supplies
                </div>
                <div className="text-[10px] text-muted-foreground md:text-[11px]">
                  B2B cleaning procurement
                </div>
              </div>
            </Link>
          </div>

          <nav className="hidden items-center gap-5 md:flex">{nav}</nav>

          <div className="flex items-center gap-2">
            {!minimal ? (
              <>
                <Link
                  href="/cart"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "relative hidden gap-2 md:inline-flex",
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                  {cartQty > 0 ? <Badge className="ml-1">{cartQty}</Badge> : null}
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden md:inline-flex"
                  onClick={() => void logoutCustomer()}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
              </>
            ) : (
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-2")}
              >
                <PhoneCall className="h-4 w-4" />
                Sign in
              </Link>
            )}

            <Sheet>
              <SheetTrigger
                render={<Button variant="outline" size="icon" className="md:hidden" />}
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-3">{nav}</div>
                {!minimal ? (
                  <div className="mt-6 flex flex-col gap-3 border-t pt-6">
                    <Link
                      href="/cart"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "w-full justify-start gap-2",
                      )}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Cart{cartQty > 0 ? ` (${cartQty})` : ""}
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => void logoutCustomer()}
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </Button>
                  </div>
                ) : null}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 py-5 md:px-4 md:py-8">{children}</main>

      {!minimal ? (
        <>
          <Link
            href="/cart"
            className={cn(
              buttonVariants({}),
              "fixed left-4 right-4 z-40 h-12 gap-2 rounded-2xl shadow-lg md:hidden",
              "bottom-[max(1rem,env(safe-area-inset-bottom))]",
            )}
          >
            <ShoppingBag className="h-5 w-5" />
            View cart
            {cartQty > 0 ? (
              <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs font-semibold">
                {cartQty}
              </span>
            ) : null}
          </Link>

          <div className="fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+6.75rem)] left-4 z-40 md:bottom-10 md:left-auto md:right-8">
            <Link
              href="/catalog"
              className={cn(
                buttonVariants({ size: "lg", variant: "secondary" }),
                "rounded-full shadow-md",
              )}
            >
              <LayoutGrid className="mr-2 h-5 w-5" />
              Browse
            </Link>
          </div>
        </>
      ) : null}

      {waHref ? (
        <a
          href={waHref}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg transition hover:bg-emerald-600 md:bottom-10 md:right-10"
          aria-label="WhatsApp support"
        >
          <PhoneCall className="h-6 w-6" />
        </a>
      ) : null}

      {!minimal ? (
        <div className="pointer-events-none fixed bottom-28 right-4 hidden text-[11px] text-muted-foreground md:block md:bottom-10 md:right-28">
          GST-compliant snapshots • Tier pricing • Fast reorder
        </div>
      ) : null}
    </div>
  );
}
