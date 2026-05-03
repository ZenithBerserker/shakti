import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { idParamSchema } from "@/lib/validation/common";

const patchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  slug: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Params) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const parsedId = idParamSchema.safeParse(id);
  if (!parsedId.success) return jsonError("Invalid id", 400);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  const slug = parsed.data.slug ? slugify(parsed.data.slug) : undefined;
  if (slug) {
    const clash = await prisma.category.findFirst({
      where: { slug, NOT: { id: parsedId.data } },
    });
    if (clash) return jsonError("Slug already in use", 409);
  }

  try {
    const updated = await prisma.category.update({
      where: { id: parsedId.data },
      data: {
        ...parsed.data,
        ...(slug ? { slug } : {}),
      },
    });
    return jsonOk(updated);
  } catch {
    return jsonError("Could not update category", 409);
  }
}

export async function DELETE(_req: Request, ctx: Params) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const parsedId = idParamSchema.safeParse(id);
  if (!parsedId.success) return jsonError("Invalid id", 400);

  const count = await prisma.product.count({
    where: { categoryId: parsedId.data },
  });
  if (count > 0) {
    return jsonError("Cannot delete category with products", 409);
  }

  await prisma.category.delete({ where: { id: parsedId.data } });
  return jsonOk({ ok: true });
}
