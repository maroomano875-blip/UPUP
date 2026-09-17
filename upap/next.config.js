/** @type {import('next').NextConfig} */
const nextConfig = {
  // دعم الرفع من الجوال (ملفات كبيرة)
  experimental: { serverActions: { bodySizeLimit: "20mb" } },
  // تحسين الصور تلقائياً بدون خدمة خارجية
  images: { unoptimized: true },
};

module.exports = nextConfig;
