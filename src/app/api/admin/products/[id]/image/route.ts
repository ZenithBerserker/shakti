import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";
import { uploadProductImage } from "@/lib/supabase/storage";
import { idParamSchema } from "@/lib/validation/common";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Params) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const parsedId = idParamSchema.safeParse(id);
  if (!parsedId.success) return jsonError("Invalid id", 400);

  const product = await prisma.product.findUnique({
    where: { id: parsedId.data },
  });
  if (!product) return jsonError("Not found", 404);

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob)) {
    return jsonError("Expected multipart field `file`", 400);
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const contentType = file.type || "application/octet-stream";
  const path = `${parsedId.data}/${Date.now()}-upload`;

  const publicUrl = await uploadProductImage(path, buf, contentType);
  if (!publicUrl) {
    return jsonError(
      "Image storage not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, or paste a public URL via product update.",
      501,
    );
  }

  const updated = await prisma.product.update({
    where: { id: parsedId.data },
    data: { imageUrl: publicUrl },
  });

  return jsonOk({ imageUrl: updated.imageUrl });
}
