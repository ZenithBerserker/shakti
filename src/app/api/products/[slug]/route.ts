import { jsonError, jsonOk } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { productInclude, serializeProduct } from "@/lib/catalog";
import { getDemoProductBySlug } from "@/lib/demo-catalog";
import { storefrontData } from "@/lib/storefront-data";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Params) {
  const { slug } = await ctx.params;
  if (!slug) return jsonError("Not found", 404);

  return storefrontData(
    async () => {
      const product = await prisma.product.findFirst({
        where: { slug, isActive: true },
        include: productInclude,
      });
      if (!product) return jsonError("Not found", 404);
      return jsonOk(serializeProduct(product));
    },
    () => {
      const product = getDemoProductBySlug(slug);
      if (!product) return jsonError("Not found", 404);
      return jsonOk(product);
    },
  );
}
