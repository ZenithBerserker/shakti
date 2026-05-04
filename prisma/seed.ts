import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
} from "../src/lib/catalog-demo-fixtures";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@12345", 12);

  await prisma.adminUser.upsert({
    where: { email: "admin@cleaningb2b.demo" },
    update: { passwordHash, name: "Operations Admin", role: Role.ADMIN },
    create: {
      email: "admin@cleaningb2b.demo",
      passwordHash,
      name: "Operations Admin",
      role: Role.ADMIN,
    },
  });

  const catRecords = [];
  for (const c of DEMO_CATEGORIES) {
    catRecords.push(
      await prisma.category.upsert({
        where: { slug: c.slug },
        update: {
          name: c.name,
          description: c.description,
          imageUrl: c.imageUrl,
        },
        create: c,
      }),
    );
  }

  const catBySlug = Object.fromEntries(catRecords.map((k) => [k.slug, k]));

  for (const p of DEMO_PRODUCTS) {
    const cat = catBySlug[p.categorySlug];
    const prod = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        categoryId: cat.id,
        name: p.name,
        sku: p.sku,
        description: p.description,
        imageUrl: p.imageUrl,
        basePrice: p.basePrice,
        gstRate: p.gstRate,
        hsnCode: p.hsnCode,
        stockQuantity: p.stockQuantity,
        minOrderQty: p.minOrderQty,
        stepQty: p.stepQty,
        isFeatured: p.isFeatured,
        isActive: true,
      },
      create: {
        categoryId: cat.id,
        name: p.name,
        sku: p.sku,
        slug: p.slug,
        description: p.description,
        imageUrl: p.imageUrl,
        basePrice: p.basePrice,
        gstRate: p.gstRate,
        hsnCode: p.hsnCode,
        stockQuantity: p.stockQuantity,
        minOrderQty: p.minOrderQty,
        stepQty: p.stepQty,
        isFeatured: p.isFeatured,
        isActive: true,
      },
      select: { id: true },
    });

    await prisma.pricingTier.deleteMany({ where: { productId: prod.id } });

    if (p.tiers?.length) {
      await prisma.pricingTier.createMany({
        data: p.tiers.map((t) => ({
          productId: prod.id,
          minQuantity: t.minQuantity,
          discountPrice: t.discountPrice,
        })),
      });
    }
  }

  console.log("Seed completed: categories, products, pricing tiers, admin user.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
