import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  // ESLintはビルド時にチェックしない
};

export default nextConfig;
