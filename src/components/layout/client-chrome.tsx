"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Droplets,
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
    <div className="flex min-h-dvh flex-1 flex-col bg-background pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-8">
      <header className="sticky top-0 z-40 border-b border-primary/10 bg-background/90 pt-[env(safe-area-inset-top)] shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
        <div className="flex w-full items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Droplets className="h-5 w-5" />
              </span>
              <div className="min-w-0 leading-tight">
                <div className="truncate text-sm font-semibold tracking-tight">Shakti Supplies</div>
                <div className="truncate text-[10px] text-muted-foreground sm:text-[11px]">
                  Liquids · mops · soaps · bulk
                </div>
              </div>
            </Link>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {!minimal ? (
              <>
                <Link
                  href="/cart"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon" }),
                    "relative h-10 w-10 rounded-xl",
                  )}
                  aria-label="Open cart"
                >
                  <ShoppingCart className="h-4 w-4" />
                  {cartQty > 0 ? (
                    <Badge className="absolute -right-1 -top-1 h-5 min-w-5 justify-center px-1 text-[10px]">
                      {cartQty > 99 ? "99+" : cartQty}
                    </Badge>
                  ) : null}
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }), "gap-1.5 rounded-xl px-3")}
              >
                <PhoneCall className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            )}

            <Sheet>
              <SheetTrigger
                render={<Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" />}
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

      <main className="w-full flex-1 px-3 py-4 sm:px-4 sm:py-6">{children}</main>

      {!minimal ? (
        <>
          <Link
            href="/cart"
            className={cn(
              buttonVariants({}),
              "fixed left-4 right-4 z-40 h-12 gap-2 rounded-2xl shadow-lg",
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

          <div className="fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom))+6.75rem)] left-4 z-40">
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
          className="fixed bottom-24 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg transition hover:bg-emerald-700"
          aria-label="WhatsApp support"
        >
          <PhoneCall className="h-6 w-6" />
        </a>
      ) : null}

    </div>
  );
}
