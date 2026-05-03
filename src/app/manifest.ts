import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shakti Supplies",
    short_name: "Shakti",
    description:
      "B2B ordering for industrial cleaning supplies — browse, reorder, GST-ready carts.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ecfdf5",
    theme_color: "#0d9488",
    categories: ["business", "shopping"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
