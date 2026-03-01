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
};

export default nextConfig;
