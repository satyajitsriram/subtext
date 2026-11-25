import type { NextConfig } from "next";
import withPWA from "next-pwa";

const baseConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    unoptimized: true, // better for PWA offline and no external loaders by default
  },
  experimental: {
    optimizeCss: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

const withPWAWrapped = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    // Basic runtime caching for pages and assets
    {
      urlPattern: ({ request }: any) =>
        request.destination === "document" ||
        request.destination === "script" ||
        request.destination === "style",
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "pages-assets",
      },
    },
    {
      urlPattern: ({ request }: any) =>
        request.destination === "image" ||
        request.destination === "font",
      handler: "CacheFirst",
      options: {
        cacheName: "static-media",
        expiration: {
          maxEntries: 256,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        },
      },
    },
  ],
});

const nextConfig = withPWAWrapped(baseConfig);

export default nextConfig;
