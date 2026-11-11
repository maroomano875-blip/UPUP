/** @type {import('next').NextConfig} */
const nextConfig = {
  // دعم الرفع من الجوال (ملفات كبيرة)
  // Next 15: الحزم الخارجية صارت مفتاحاً رئيسياً (كانت داخل experimental)
  serverExternalPackages: ["sharp","@napi-rs/canvas","pdf-parse","unpdf","heic-convert","mammoth","exceljs"],
  experimental: { serverActions: { bodySizeLimit: "20mb" } },
  // تحسين الصور تلقائياً بدون خدمة خارجية
  images: { unoptimized: true },
};

module.exports = nextConfig;
