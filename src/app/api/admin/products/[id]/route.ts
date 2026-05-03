import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { productInclude, serializeProduct } from "@/lib/catalog";
import { idParamSchema } from "@/lib/validation/common";

const tierSchema = z.object({
  minQuantity: z.number().int().min(1),
  discountPrice: z.number().positive(),
});

const patchSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2).max(200).optional(),
  sku: z.string().min(2).max(64).optional(),
  slug: z.string().min(2).max(120).optional(),
  description: z.string().min(2).max(8000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  basePrice: z.number().positive().optional(),
  gstRate: z.number().min(0).max(28).optional(),
  hsnCode: z.string().max(32).optional().nullable(),
  stockQuantity: z.number().int().min(0).optional(),
  minOrderQty: z.number().int().min(1).optional(),
  stepQty: z.number().int().min(1).optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  pricingTiers: z.array(tierSchema).optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Params) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const parsed = idParamSchema.safeParse(id);
  if (!parsed.success) return jsonError("Invalid id", 400);

  const product = await prisma.product.findUnique({
    where: { id: parsed.data },
    include: productInclude,
  });
  if (!product) return jsonError("Not found", 404);

  return jsonOk(serializeProduct(product));
}

export async function PATCH(req: Request, ctx: Params) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const parsedId = idParamSchema.safeParse(id);
  if (!parsedId.success) return jsonError("Invalid id", 400);

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  const existing = await prisma.product.findUnique({
    where: { id: parsedId.data },
  });
  if (!existing) return jsonError("Not found", 404);

  let slug = parsed.data.slug;
  if (slug) {
    slug = slugify(slug);
    const clash = await prisma.product.findFirst({
      where: { slug, NOT: { id: parsedId.data } },
    });
    if (clash) return jsonError("Slug already in use", 409);
  }

  try {
    const data: Record<string, unknown> = { ...parsed.data };
    delete data.pricingTiers;
    if (slug) data.slug = slug;

    const updated = await prisma.$transaction(async (tx) => {
      if (parsed.data.pricingTiers) {
        await tx.pricingTier.deleteMany({
          where: { productId: parsedId.data },
        });
      }

      const p = await tx.product.update({
        where: { id: parsedId.data },
        data: {
          ...Object.fromEntries(
            Object.entries(data).filter(([, v]) => v !== undefined),
          ),
          ...(parsed.data.pricingTiers
            ? {
                pricingTiers: {
                  createMany: {
                    data: parsed.data.pricingTiers.map((t) => ({
                      minQuantity: t.minQuantity,
                      discountPrice: t.discountPrice,
                    })),
                  },
                },
              }
            : {}),
        },
        include: productInclude,
      });
      return p;
    });

    return jsonOk(serializeProduct(updated));
  } catch (e) {
    console.error("[admin/products PATCH]", e);
    return jsonError("Could not update product", 409);
  }
}

export async function DELETE(_req: Request, ctx: Params) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { id } = await ctx.params;
  const parsedId = idParamSchema.safeParse(id);
  if (!parsedId.success) return jsonError("Invalid id", 400);

  await prisma.product.update({
    where: { id: parsedId.data },
    data: { isActive: false },
  });

  return jsonOk({ ok: true });
}
