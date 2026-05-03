import { isDemoCatalog } from "@/lib/demo-catalog";

/**
 * Loads live catalogue data when configured; otherwise uses demo fixtures.
 * If Postgres is unreachable or misconfigured, falls back to demo data instead of 500.
 */
export async function storefrontData<T>(
  loadFromDatabase: () => Promise<T>,
  loadDemoFallback: () => T | Promise<T>,
): Promise<T> {
  if (isDemoCatalog()) {
    return loadDemoFallback();
  }
  try {
    return await loadFromDatabase();
  } catch (err) {
    console.warn(
      "[storefront] Database unreachable — serving bundled demo catalogue instead.",
      err,
    );
    return loadDemoFallback();
  }
}
