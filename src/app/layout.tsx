import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { MotionPreference } from "@/components/MotionPreference";
import { RewardLayer } from "@/components/RewardLayer";
import { ServiceWorker } from "@/components/ServiceWorker";
import { Toaster } from "@/components/Toast";
import { SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, siteUrl } from "@/lib/site";

const fraunces = localFont({
  src: [
    { path: "../fonts/Fraunces-Variable.woff2", style: "normal", weight: "100 900" },
    { path: "../fonts/Fraunces-Variable-Italic.woff2", style: "italic", weight: "100 900" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  fallback: ["Georgia", "serif"],
});

const dmSans = localFont({
  src: "../fonts/DMSans-Variable.woff2",
  weight: "100 1000",
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#F6F1E9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} antialiased`}>
      <body className="min-h-dvh">
        {children}
        <Toaster />
        <RewardLayer />
        <MotionPreference />
        <ServiceWorker />
      </body>
    </html>
  );
}
