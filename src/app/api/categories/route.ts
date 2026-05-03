import { jsonOk } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { listDemoCategoriesForApi } from "@/lib/demo-catalog";
import { storefrontData } from "@/lib/storefront-data";

export async function GET() {
  return storefrontData(
    async () => {
      const rows = await prisma.category.findMany({
        orderBy: { name: "asc" },
        include: {
          _count: { select: { products: { where: { isActive: true } } } },
        },
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
    },
    () => jsonOk(listDemoCategoriesForApi()),
  );
}
