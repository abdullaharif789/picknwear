// next.config.js

const config = require("./src/config/config.json");

const nextConfig = {
  reactStrictMode: true,
  trailingSlash: config.site?.trailing_slash || false,
  transpilePackages: ["next-mdx-remote"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
