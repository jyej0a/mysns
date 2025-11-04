import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "img.clerk.com" },
      { hostname: "images.unsplash.com" },
      // Supabase Storage 도메인 추가 (실제 프로덕션에서는 Supabase Storage URL 사용)
      { hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
