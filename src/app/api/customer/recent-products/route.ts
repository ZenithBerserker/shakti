import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireCustomer } from "@/lib/api/customer-auth";
import { prisma } from "@/lib/prisma";
import { productInclude, serializeProduct } from "@/lib/catalog";

export async function GET() {
  const { error, userId } = await requireCustomer();
  if (error || !userId) return jsonError("Unauthorized", 401);

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      items: {
        select: { productId: true },
      },
    },
  });

  const seen = new Set<string>();
  const ids: string[] = [];
  for (const o of orders) {
    for (const i of o.items) {
      if (!seen.has(i.productId)) {
        seen.add(i.productId);
        ids.push(i.productId);
      }
      if (ids.length >= 12) break;
    }
    if (ids.length >= 12) break;
  }

  if (ids.length === 0) return jsonOk({ items: [] });

  const products = await prisma.product.findMany({
    where: { id: { in: ids }, isActive: true },
    include: productInclude,
  });

  const map = new Map(products.map((p) => [p.id, p]));
  const items = ids
    .map((id) => map.get(id))
    .filter(Boolean)
    .map((p) => serializeProduct(p!));

  return jsonOk({ items });
}
