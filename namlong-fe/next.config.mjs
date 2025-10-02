/** @type {import('next').NextConfig} */
import path from 'path';

const nextConfig = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: ["@mantine/core", "@mantine/hooks"]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@': path.resolve(process.cwd(), './src'),
    };
    return config;
  },
};

export default nextConfig; 
