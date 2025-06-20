import type { NextConfig } from "next";

const nextConfig: NextConfig = {reactStrictMode: false, // Nonaktifkan Strict Mode
  async redirects() {
    return [
      {
        source: '/',
        destination: '/login',
        permanent: true,      
      },
    ];
  },
  /* config options here */
};

export default nextConfig;
