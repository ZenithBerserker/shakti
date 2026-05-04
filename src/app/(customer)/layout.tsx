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
    <div
      className={
        "min-h-dvh max-lg:flex max-lg:min-h-dvh max-lg:items-center max-lg:justify-center " +
        "max-lg:bg-[radial-gradient(120%_80%_at_50%_-10%,oklch(0.92_0.06_175),oklch(0.94_0.03_200)_45%,oklch(0.88_0.02_210))] " +
        "max-lg:py-8 max-lg:px-4 lg:bg-background"
      }
    >
      {/* max-lg: translate3d keeps position:fixed chrome inside the phone shell; lg+: full-width web layout */}
      <div
        className={
          "relative flex min-h-dvh w-full flex-col bg-background " +
          "max-lg:max-h-[min(100dvh,900px)] max-lg:min-h-[min(100dvh,900px)] max-lg:max-w-[420px] max-lg:overflow-x-hidden max-lg:overflow-y-auto " +
          "max-lg:rounded-[2.25rem] max-lg:border max-lg:border-primary/15 max-lg:shadow-[0_28px_90px_-20px_rgba(13,148,136,0.45)] max-lg:[transform:translate3d(0,0,0)] " +
          "lg:mx-auto lg:min-h-dvh lg:max-h-none lg:w-full lg:max-w-6xl lg:rounded-none lg:border-0 lg:shadow-none lg:[transform:none]"
        }
      >
        <DemoCatalogProvider value={demo}>
          <ClientChrome>{children}</ClientChrome>
        </DemoCatalogProvider>
      </div>
    </div>
  );
}
