/** @type {import('next').NextConfig} */
const nextConfig = {
  // دعم الرفع من الجوال (ملفات كبيرة)
  experimental: { serverComponentsExternalPackages: ["sharp","@napi-rs/canvas","pdf-parse","unpdf","heic-convert","mammoth","exceljs"], serverActions: { bodySizeLimit: "20mb" } },
  // تحسين الصور تلقائياً بدون خدمة خارجية
  images: { unoptimized: true },
};

module.exports = nextConfig;
