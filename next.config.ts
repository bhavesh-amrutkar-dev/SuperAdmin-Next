import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

/** @type {NextConfig} */
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: "https", hostname: "cdn.donrifa.com" },
      { protocol: "https", hostname: "dkzgp10lku01a.cloudfront.net" },
      { protocol: "https", hostname: "de76f8ebaaega.cloudfront.net" },
      { protocol: "https", hostname: "s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "donrifa-b35473f7c0199882.s3.us-east-1.amazonaws.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },

  compress: true,
  productionBrowserSourceMaps: false,

  env: {
    NEXT_PUBLIC_NODE_DMS_API: process.env.NEXT_PUBLIC_NODE_DMS_API,
    NEXT_PUBLIC_PYTHON_API: process.env.NEXT_PUBLIC_PYTHON_API,
  },

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
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=0, s-maxage=86400, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },

  experimental: {
    scrollRestoration: true,
  },

  async redirects() {
    return [
      // Normalize common misspelling - redirect old path to new path
      {
        source: "/raffles_list_details",
        destination: "/raffles",
        permanent: true,
      },
      {
        source: "/raffles_list_details/:path*",
        destination: "/raffles/:path*",
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
