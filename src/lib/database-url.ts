/**
 * Neon’s dashboard often appends `channel_binding=require`. Some Node/serverless TLS stacks
 * fail handshakes with that flag — Prisma may surface it as P1001 “Can’t reach database”.
 */
export function sanitizePostgresUrl(url: string): string {
  const q = url.indexOf("?");
  if (q === -1) return url;
  const base = url.slice(0, q);
  const params = new URLSearchParams(url.slice(q + 1));
  params.delete("channel_binding");
  const tail = params.toString();
  return tail ? `${base}?${tail}` : base;
}
