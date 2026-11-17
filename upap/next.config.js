/** @type {import('next').NextConfig} */
const nextConfig = {
  // دعم الرفع من الجوال (ملفات كبيرة)
  // Next 15: الحزم الخارجية صارت مفتاحاً رئيسياً (كانت داخل experimental)
  serverExternalPackages: ["sharp","@napi-rs/canvas","pdf-parse","unpdf","heic-convert","mammoth","exceljs"],
  experimental: { serverActions: { bodySizeLimit: "20mb" } },
  // تحسين الصور تلقائياً بدون خدمة خارجية
  images: { unoptimized: true },
  // رؤوس أمان مجانية يطبّقها المتصفح (بلا CSP عمداً: تحتاج اختباراً أدق حتى لا تكسر الصفحات)
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
