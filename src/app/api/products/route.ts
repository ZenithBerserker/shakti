import { jsonOk } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { serializeProduct, productInclude } from "@/lib/catalog";
import {
  filterDemoProducts,
  sliceDemoPage,
  sortDemoProducts,
} from "@/lib/demo-catalog";
import { storefrontData } from "@/lib/storefront-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId");
  const featured = searchParams.get("featured") === "true";
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    48,
    Math.max(1, Number(searchParams.get("pageSize") ?? "24")),
  );

  const demoResponse = () => {
    const sorted = sortDemoProducts(
      filterDemoProducts({
        q,
        categoryId: categoryId ?? undefined,
        featured: featured || undefined,
      }),
    );
    const { total, slice } = sliceDemoPage(sorted, page, pageSize);
    return jsonOk({
      page,
      pageSize,
      total,
      items: slice,
    });
  };

  return storefrontData(async () => {
    const where = {
      isActive: true,
      ...(featured ? { isFeatured: true } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" as const } },
              { sku: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, rows] = await prisma.$transaction([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: [{ isFeatured: "desc" }, { name: "asc" }],
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
  }, demoResponse);
}
