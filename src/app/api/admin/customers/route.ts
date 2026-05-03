import { jsonError, jsonOk } from "@/lib/api/errors";
import { requireAdmin } from "@/lib/api/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { error } = await requireAdmin();
  if (error) return jsonError("Unauthorized", 401);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    80,
    Math.max(1, Number(searchParams.get("pageSize") ?? "20")),
  );

  const where = q
    ? {
        OR: [
          { phone: { contains: q } },
          { businessName: { contains: q, mode: "insensitive" as const } },
          { contactPerson: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { gstin: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [total, rows] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: {
          select: { orders: true, addresses: true },
        },
      },
    }),
  ]);

  return jsonOk({
    page,
    pageSize,
    total,
    items: rows.map((u) => ({
      id: u.id,
      phone: u.phone,
      businessName: u.businessName,
      contactPerson: u.contactPerson,
      email: u.email,
      gstin: u.gstin,
      businessType: u.businessType,
      createdAt: u.createdAt.toISOString(),
      orders: u._count.orders,
      addresses: u._count.addresses,
    })),
  });
}
