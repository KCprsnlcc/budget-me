import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['date-fns-tz'],
  env: {
    TZ: 'Asia/Manila',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'noagsxfixjrgatexuwxm.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
