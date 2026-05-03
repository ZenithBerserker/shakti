"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatINR } from "@/lib/money";

type LastCheckout = {
  order: {
    orderNumber: string;
    grandTotal: string;
  };
  whatsappNotifyUrl: string | null;
};

export default function CheckoutSuccessPage() {
  const [payload, setPayload] = useState<LastCheckout | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem("lastCheckout");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as LastCheckout;
      setPayload(parsed);
    } catch {
      /* ignore */
    } finally {
      sessionStorage.removeItem("lastCheckout");
    }
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card className="border-emerald-500/30 bg-emerald-500/5">
        <CardHeader>
          <CardTitle className="text-3xl">Order confirmed</CardTitle>
          <p className="text-sm text-muted-foreground">
            Thank you — your fulfilment snapshot is locked for GST reporting.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {payload ? (
            <>
              <div className="rounded-2xl border bg-background p-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Order number
                    </div>
                    <div className="font-mono text-lg font-semibold">
                      {payload.order.orderNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">
                      Grand total
                    </div>
                    <div className="text-xl font-semibold">
                      {formatINR(Number(payload.order.grandTotal))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/orders" className={cn(buttonVariants({}), "rounded-2xl")}>
                  View order history
                </Link>
                <Link
                  href="/catalog"
                  className={cn(buttonVariants({ variant: "outline" }), "rounded-2xl")}
                >
                  Continue shopping
                </Link>
                {payload.whatsappNotifyUrl ? (
                  <a
                    href={payload.whatsappNotifyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "secondary" }), "rounded-2xl")}
                  >
                    WhatsApp confirmation
                  </a>
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              If you don&apos;t see order details here, open{" "}
              <Link className="underline" href="/orders">
                Orders
              </Link>{" "}
              from your account menu.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
