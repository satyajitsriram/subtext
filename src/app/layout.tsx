import type { Metadata, Viewport } from "next";
import { Barlow_Semi_Condensed, Spectral } from "next/font/google";
import "./globals.css";
import { GameProvider } from "@/lib/state";

const headingFont = Barlow_Semi_Condensed({
  variable: "--font-heading",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});
const bodyFont = Spectral({
  variable: "--font-body",
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Subtext",
  description: "Pass-and-play social deduction word game. Offline-ready PWA.",
  applicationName: "Subtext",
  manifest: "/manifest.json",
  themeColor: "#0b0f14",
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }
    ]
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <GameProvider>{children}</GameProvider>
      </body>
    </html>
  );
}
