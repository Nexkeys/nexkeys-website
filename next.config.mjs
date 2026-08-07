/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  experimental: {
    /* Barrel-file tree shaking. `lucide-react` ships ~1,500 icon modules and
       `import { Menu } from 'lucide-react'` pulls the whole index before this
       is enabled. Same story for the framer-motion and Radix barrels. This is
       the cheapest bundle win available to us. */
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'date-fns',
      '@react-three/drei',
    ],
  },

  images: {
    // Modern formats first — this is where the ~33MB → ~2MB win comes from.
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      // thum.io screenshots — fallback only, for projects with no local thumbnail.
      { protocol: 'https', hostname: 'image.thum.io' },
      // Blog cover images authored through the admin panel.
      { protocol: 'https', hostname: '**' },
    ],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
  },

  // Legacy .html URLs keep working so no inbound link ever 404s.
  async redirects() {
    return [
      { source: '/index.html', destination: '/', permanent: true },
      { source: '/work.html', destination: '/work', permanent: true },
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/blog.html', destination: '/blog', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/internship.html', destination: '/internship', permanent: true },
      { source: '/privacy.html', destination: '/privacy', permanent: true },
      { source: '/terms.html', destination: '/terms', permanent: true },
      { source: '/legal.html', destination: '/legal', permanent: true },
      { source: '/admin.html', destination: '/admin', permanent: true },
    ];
  },
};

export default nextConfig;
