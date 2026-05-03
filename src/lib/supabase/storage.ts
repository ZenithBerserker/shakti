import { createClient } from "@supabase/supabase-js";

export function getSupabaseServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function uploadProductImage(
  path: string,
  bytes: Buffer,
  contentType: string,
): Promise<string | null> {
  const client = getSupabaseServiceClient();
  if (!client) return null;

  const bucket = process.env.SUPABASE_PRODUCT_BUCKET ?? "product-images";

  const { error } = await client.storage.from(bucket).upload(path, bytes, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error("[supabase upload]", error.message);
    return null;
  }

  const {
    data: { publicUrl },
  } = client.storage.from(bucket).getPublicUrl(path);

  return publicUrl;
}
