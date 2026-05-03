import { z } from "zod";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const createSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const rows = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return jsonOk(
    rows.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      description: c.description,
      imageUrl: c.imageUrl,
      productCount: c._count.products,
    })),
  );
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.message, 422);

  const baseSlug = parsed.data.slug ?? slugify(parsed.data.name);
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.category.findUnique({ where: { slug } });
    if (!exists) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  try {
    const cat = await prisma.category.create({
      data: {
        name: parsed.data.name,
        slug,
        description: parsed.data.description ?? null,
        imageUrl: parsed.data.imageUrl ?? null,
      },
    });
    return jsonOk(cat, 201);
  } catch (e) {
    console.error("[admin/categories POST]", e);
    return jsonError("Could not create category", 409);
  }
}
