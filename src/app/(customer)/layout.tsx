import { ClientChrome } from "@/components/layout/client-chrome";
import { DemoCatalogProvider } from "@/components/demo-catalog-context";
import { storefrontBrowseUsesBundledCatalog } from "@/lib/storefront-client-mode";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const demo = await storefrontBrowseUsesBundledCatalog();
  return (
    <DemoCatalogProvider value={demo}>
      <ClientChrome>{children}</ClientChrome>
    </DemoCatalogProvider>
  );
}
