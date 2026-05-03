import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { isDemoCatalog } from "@/lib/demo-catalog";

/**
 * Whether the storefront browse experience should behave like demo/fixtures mode on the client
 * (+ button, recent picks URL, etc.). Matches env/placeholder rules plus unreachable Postgres.
 */
export const storefrontBrowseUsesBundledCatalog = cache(async (): Promise<boolean> => {
  if (isDemoCatalog()) return true;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return false;
  } catch {
    return true;
  }
});
