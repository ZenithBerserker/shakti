"use client";

import { useEffect, useRef } from "react";
import { playAdminOrderBeep } from "@/components/admin/play-order-sound";

export function OrderAlertPoller() {
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/admin/dashboard", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = (await res.json()) as {
          latestOrderCreatedAt?: string | null;
        };
        const ts = data.latestOrderCreatedAt ?? null;
        if (!ts) return;
        if (lastRef.current && lastRef.current !== ts) {
          playAdminOrderBeep();
        }
        lastRef.current = ts;
      } catch {
        /* ignore */
      }
    }

    poll();
    const id = window.setInterval(() => {
      if (!cancelled) void poll();
    }, 28_000);

    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  return null;
}
