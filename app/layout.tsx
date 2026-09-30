import type { Metadata, Viewport } from "next";
import "./globals.css";
import { I18nProvider } from "@/lib/i18n/context";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import OfflineIndicator from "@/components/OfflineIndicator";

export const metadata: Metadata = {
  title: "SiraHub | On-Demand Local Trades Marketplace (Addis Ababa)",
  description:
    "Connect with verified local skilled technicians in Addis Ababa (plumbers, electricians, painters, DSTV, appliance repairers). 100% Escrow Protected with Chapa & Telebirr.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SiraHub",
  },
  icons: {
    icon: "/icons/icon-192.svg",
    apple: "/icons/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#059669",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SiraHub" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 antialiased selection:bg-emerald-500 selection:text-white">
        <I18nProvider>
          <OfflineIndicator />
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
          <PWAInstallBanner />
        </I18nProvider>
      </body>
    </html>
  );
}
