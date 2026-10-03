import { Geist, Geist_Mono } from "next/font/google";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/JsonLd";
import { ConditionalSiteFooter } from "@/components/ConditionalSiteFooter";
import { InstallAppBanner } from "@/components/InstallAppBanner";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Fiches révision Bac 2027 + quiz | Révision facile",
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Révision facile — fiches de révision Bac 2027, Brevet et BTS",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fiches révision Bac 2027 + quiz | Révision facile",
    description: DEFAULT_DESCRIPTION,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  applicationName: SITE_NAME,
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#4f46e5",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full min-h-dvh antialiased`}
      suppressHydrationWarning
    >
      <head>
        <WebsiteJsonLd />
        <OrganizationJsonLd />
      </head>
      <body
        className="flex min-h-dvh flex-col bg-[var(--background)] text-[var(--foreground)]"
        suppressHydrationWarning
      >
        <ServiceWorkerRegister />
        <div className="flex flex-1 flex-col">{children}</div>
        <ConditionalSiteFooter />
        <InstallAppBanner />
      </body>
    </html>
  );
}
