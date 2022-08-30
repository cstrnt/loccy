// const withTM = require('next-transpile-modules')(['next-international']);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
  },
  experimental: {
    urlImports: ['http://localhost:3000/'],
  },
};

module.exports = nextConfig;
