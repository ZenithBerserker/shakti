import { OrderStatus } from "@prisma/client";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";
import { decToString } from "@/lib/money";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const [
    salesAgg,
    customerCount,
    orderCount,
    recentOrders,
    lowStockCount,
    latestOrder,
  ] = await prisma.$transaction([
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { status: { not: OrderStatus.CANCELLED } },
    }),
    prisma.user.count(),
    prisma.order.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        user: {
          select: {
            phone: true,
            businessName: true,
            contactPerson: true,
          },
        },
      },
    }),
    prisma.product.count({
      where: {
        isActive: true,
        stockQuantity: { gt: 0, lt: LOW_STOCK_THRESHOLD },
      },
    }),
    prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
      select: { id: true, createdAt: true, orderNumber: true },
    }),
  ]);

  const totalSales = Number(salesAgg._sum.grandTotal ?? 0);

  return jsonOk({
    totalSales: decToString(totalSales),
    totalCustomers: customerCount,
    totalOrders: orderCount,
    lowStockCount,
    latestOrderCreatedAt: latestOrder?.createdAt.toISOString() ?? null,
    latestOrderNumber: latestOrder?.orderNumber ?? null,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      grandTotal: decToString(o.grandTotal),
      createdAt: o.createdAt.toISOString(),
      customerPhone: o.user.phone,
      businessName: o.user.businessName,
      contactPerson: o.user.contactPerson,
    })),
  });
}
