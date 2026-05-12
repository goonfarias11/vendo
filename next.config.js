/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/:path*",
          has: [{ type: "host", value: "(?<slug>[^.]+)\\.vendo\\.app" }],
          destination: "/s/:slug/:path*",
        },
      ],
    };
  },
};

module.exports = nextConfig;