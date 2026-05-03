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
    <div className="min-h-dvh md:flex md:min-h-dvh md:items-center md:justify-center md:bg-[radial-gradient(120%_80%_at_50%_-10%,oklch(0.92_0.06_175),oklch(0.94_0.03_200)_45%,oklch(0.88_0.02_210))] md:py-8 md:px-4">
      {/* translate3d creates a containing block so position:fixed chrome (cart FAB) stays inside the “phone” on desktop */}
      <div className="relative flex min-h-dvh w-full flex-col bg-background md:max-h-[min(100dvh,900px)] md:min-h-[min(100dvh,900px)] md:max-w-[420px] md:overflow-x-hidden md:overflow-y-auto md:rounded-[2.25rem] md:border md:border-primary/15 md:shadow-[0_28px_90px_-20px_rgba(13,148,136,0.45)] md:[transform:translate3d(0,0,0)]">
        <DemoCatalogProvider value={demo}>
          <ClientChrome>{children}</ClientChrome>
        </DemoCatalogProvider>
      </div>
    </div>
  );
}
