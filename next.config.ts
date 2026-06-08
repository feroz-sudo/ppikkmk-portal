import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          }
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ppikkmk-portal.vercel.app',
          },
        ],
        destination: 'https://ppikkmk.com/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
