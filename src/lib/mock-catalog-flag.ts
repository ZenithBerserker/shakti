/**
 * Shared parsing for demo/mock catalogue mode (.env quirks: quotes, CRLF, "1", etc.).
 */
export function parseEnvTruthy(raw: string | undefined): boolean {
  if (raw == null || raw === "") return false;
  const v = raw.trim().replace(/\r$/, "").toLowerCase();
  return v === "true" || v === "1" || v === "yes" || v === "on";
}

/** Server + client: respects NEXT_PUBLIC_USE_MOCK_CATALOG */
export function isMockCatalogPublicEnv(): boolean {
  return parseEnvTruthy(process.env.NEXT_PUBLIC_USE_MOCK_CATALOG);
}

/** Server only: also accepts USE_MOCK_CATALOG so SSR works even if NEXT_PUBLIC was omitted */
export function isMockCatalogServerEnv(): boolean {
  return (
    isMockCatalogPublicEnv() ||
    parseEnvTruthy(process.env.USE_MOCK_CATALOG)
  );
}

/**
 * True when DATABASE_URL is missing or still an unedited Supabase template — avoids Prisma 500s on browse routes.
 */
export function databaseUrlLooksUnsetOrPlaceholder(): boolean {
  const raw = process.env.DATABASE_URL?.trim() ?? "";
  if (!raw) return true;
  return (
    raw.includes("[project-ref]") ||
    raw.includes("[password]") ||
    raw.includes("[region]")
  );
}
