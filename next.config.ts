import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.donrifa.com" },
      { protocol: "https", hostname: "dkzgp10lku01a.cloudfront.net" },
      { protocol: "https", hostname: "de76f8ebaaega.cloudfront.net" },
      { protocol: "https", hostname: "s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  compress: true,
  productionBrowserSourceMaps: false,


  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  }
,

  experimental: {
    scrollRestoration: true,
  },
};

export default withNextIntl(nextConfig);
