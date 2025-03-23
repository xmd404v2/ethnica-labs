/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Set the base path if deploying to a subdirectory
  // basePath: '',
};

module.exports = nextConfig; 