import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { productInclude, serializeProduct } from "@/lib/catalog";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const items = await prisma.product.findMany({
    where: {
      isActive: true,
      stockQuantity: { gt: 0, lt: LOW_STOCK_THRESHOLD },
    },
    include: productInclude,
    orderBy: { stockQuantity: "asc" },
    take: 200,
  });

  return jsonOk({
    threshold: LOW_STOCK_THRESHOLD,
    items: items.map(serializeProduct),
  });
}
