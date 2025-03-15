/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Add the Netlify plugin for Next.js 
  images: {
    unoptimized: true, // For static site exports
  },
  // Set the base path if deploying to a subdirectory
  // basePath: '',
  // Set the output to 'export' for static site generation
  output: 'export',
};

module.exports = nextConfig; 