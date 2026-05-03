import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ecfdf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export const metadata: Metadata = {
  title: {
    default: "Shakti Supplies — B2B Cleaning Procurement",
    template: "%s · Shakti Supplies",
  },
  description:
    "Mobile-first B2B ordering for industrial cleaning supplies across India — OTP login, GST-ready orders, tier pricing, and admin fulfilment tooling.",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml", sizes: "512x512" }],
  },
  appleWebApp: {
    capable: true,
    title: "Shakti Supplies",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
