import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    // Если картинки с конкретных доменов
    domains: ['cdn.example.com', 'images.unsplash.com', 'res.cloudinary.com'],
    
    // Или для всех доменов (для разработки)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // разрешает все домены
      },
    ],
    
    // Или если не нужна оптимизация (просто отдать картинку как есть)
    unoptimized: true,
  },
};

export default nextConfig;
