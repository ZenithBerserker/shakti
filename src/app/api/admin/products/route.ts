import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { productInclude, serializeProduct } from "@/lib/catalog";

const tierSchema = z.object({
  minQuantity: z.number().int().min(1),
  discountPrice: z.number().positive(),
});

const createSchema = z.object({
  categoryId: z.string().uuid(),
  name: z.string().min(2).max(200),
  sku: z.string().min(2).max(64),
  slug: z.string().min(2).max(120).optional(),
  description: z.string().min(2).max(8000),
  imageUrl: z.string().url().optional().nullable(),
  basePrice: z.number().positive(),
  gstRate: z.number().min(0).max(28),
  hsnCode: z.string().max(32).optional().nullable(),
  stockQuantity: z.number().int().min(0),
  minOrderQty: z.number().int().min(1).default(1),
  stepQty: z.number().int().min(1).default(1),
  isFeatured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  pricingTiers: z.array(tierSchema).optional().default([]),
});

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    100,
    Math.max(1, Number(searchParams.get("pageSize") ?? "24")),
  );

  const where = {
    ...(categoryId ? { categoryId } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return jsonOk({
    page,
    pageSize,
    total,
    items: rows.map(serializeProduct),
  });
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  const baseSlug = parsed.data.slug ?? slugify(`${parsed.data.name}-${parsed.data.sku}`);
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  try {
    const product = await prisma.product.create({
      data: {
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        sku: parsed.data.sku,
        slug,
        description: parsed.data.description,
        imageUrl: parsed.data.imageUrl ?? null,
        basePrice: parsed.data.basePrice,
        gstRate: parsed.data.gstRate,
        hsnCode: parsed.data.hsnCode ?? null,
        stockQuantity: parsed.data.stockQuantity,
        minOrderQty: parsed.data.minOrderQty,
        stepQty: parsed.data.stepQty,
        isFeatured: parsed.data.isFeatured,
        isActive: parsed.data.isActive,
        pricingTiers: {
          createMany: {
            data: parsed.data.pricingTiers.map((t) => ({
              minQuantity: t.minQuantity,
              discountPrice: t.discountPrice,
            })),
          },
        },
      },
      include: productInclude,
    });
    return jsonOk(serializeProduct(product), 201);
  } catch (e) {
    console.error("[admin/products POST]", e);
    return jsonError("Could not create product (duplicate SKU/slug?)", 409);
  }
}
