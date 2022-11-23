/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["de", "en"],
    defaultLocale: "en",
  },
  async rewrites() {
    return [
      {
        source: "/docs/:path*",
        destination: `https://docs.loccy.app/docs/:path*`,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/app/:path",
        destination: "/app/:path/translations",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
