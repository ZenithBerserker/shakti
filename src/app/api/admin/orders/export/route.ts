import { OrderStatus, Prisma } from "@prisma/client";
import { jsonError } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";

function csvEscape(val: unknown) {
  const s = String(val ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status") as OrderStatus | null;
  const q = searchParams.get("q")?.trim();
  const from = searchParams.get("from");
  const to = searchParams.get("to");

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
                ],
              },
            },
          ],
        }
      : {}),
  };

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: {
      user: {
        select: {
          phone: true,
          businessName: true,
          gstin: true,
        },
      },
      items: true,
    },
  });

  const headers = [
    "orderNumber",
    "status",
    "createdAt",
    "customerPhone",
    "businessName",
    "gstin",
    "deliveryCity",
    "deliveryPincode",
    "grandTotal",
    "sku",
    "productName",
    "qty",
    "lineTotal",
  ];

  const lines = [headers.join(",")];

  for (const o of orders) {
    for (const it of o.items) {
      lines.push(
        [
          csvEscape(o.orderNumber),
          csvEscape(o.status),
          csvEscape(o.createdAt.toISOString()),
          csvEscape(o.user.phone),
          csvEscape(o.user.businessName),
          csvEscape(o.user.gstin),
          csvEscape(o.deliveryCity),
          csvEscape(o.deliveryPincode),
          csvEscape(o.grandTotal.toString()),
          csvEscape(it.sku),
          csvEscape(it.productName),
          csvEscape(it.quantity),
          csvEscape(it.totalPrice.toString()),
        ].join(","),
      );
    }
    if (o.items.length === 0) {
      lines.push(
        [
          csvEscape(o.orderNumber),
          csvEscape(o.status),
          csvEscape(o.createdAt.toISOString()),
          csvEscape(o.user.phone),
          csvEscape(o.user.businessName),
          csvEscape(o.user.gstin),
          csvEscape(o.deliveryCity),
          csvEscape(o.deliveryPincode),
          csvEscape(o.grandTotal.toString()),
          "",
          "",
          "",
          "",
        ].join(","),
      );
    }
  }

  const csv = lines.join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="orders-export.csv"`,
    },
  });
}
