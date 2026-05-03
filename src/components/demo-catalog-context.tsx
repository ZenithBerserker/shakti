"use client";

import { createContext, useContext, type ReactNode } from "react";
import { isMockCatalogPublicEnv } from "@/lib/mock-catalog-flag";

const DemoCatalogContext = createContext<boolean | undefined>(undefined);

export function DemoCatalogProvider({
  value,
  children,
}: {
  value: boolean;
  children: ReactNode;
}) {
  return (
    <DemoCatalogContext.Provider value={value}>{children}</DemoCatalogContext.Provider>
  );
}

/** Matches server demo-catalog routing (includes auto-fallback when DATABASE_URL is a placeholder). */
export function useStorefrontDemoCatalog(): boolean {
  const fromLayout = useContext(DemoCatalogContext);
  if (fromLayout !== undefined) return fromLayout;
  return isMockCatalogPublicEnv();
}
