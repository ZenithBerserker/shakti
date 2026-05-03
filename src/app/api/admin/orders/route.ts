import { OrderStatus, Prisma } from "@prisma/client";
import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";
import { decToString } from "@/lib/money";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") as OrderStatus | null;
  const q = searchParams.get("q")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    80,
    Math.max(1, Number(searchParams.get("pageSize") ?? "20")),
  );

  const allowed = Object.values(OrderStatus);
  const statusFilter =
    statusParam && allowed.includes(statusParam) ? statusParam : undefined;

  const createdAt: Prisma.DateTimeFilter = {};
  if (from) {
    const d = new Date(from);
    if (!Number.isNaN(d.getTime())) createdAt.gte = d;
  }
  if (to) {
    const d = new Date(to);
    if (!Number.isNaN(d.getTime())) createdAt.lte = d;
  }

  const where: Prisma.OrderWhereInput = {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(Object.keys(createdAt).length ? { createdAt } : {}),
    ...(q
      ? {
          OR: [
            { orderNumber: { contains: q, mode: "insensitive" } },
            {
              user: {
                OR: [
                  { phone: { contains: q } },
                  {
                    businessName: {
                      contains: q,
                      mode: "insensitive",
                    },
                  },
                  {
                    contactPerson: {
                      contains: q,
                      mode: "insensitive",
                    },
                  },
                ],
              },
            },
          ],
        }
      : {}),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        user: {
          select: {
            phone: true,
            businessName: true,
            contactPerson: true,
            gstin: true,
          },
        },
        items: true,
      },
    }),
  ]);

  return jsonOk({
    page,
    pageSize,
    total,
    items: rows.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      customerNotes: o.customerNotes,
      grandTotal: decToString(o.grandTotal),
      createdAt: o.createdAt.toISOString(),
      deliveryCity: o.deliveryCity,
      deliveryPincode: o.deliveryPincode,
      customerPhone: o.user.phone,
      businessName: o.user.businessName,
      gstin: o.user.gstin,
      lines: o.items.length,
    })),
  });
}
