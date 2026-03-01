import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Set timezone for server-side rendering
  serverExternalPackages: ['date-fns-tz'],
  // Environment variables for timezone
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
