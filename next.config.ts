import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Ignore Node.js modules that PDF.js tries to import in the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        url: false,
        buffer: false,
      };

      // Ignore specific modules that cause issues
      config.externals = config.externals || [];
      config.externals.push({
        canvas: "canvas",
        "pdf-parse": "pdf-parse",
      });
    }

    return config;
  },
};

export default nextConfig;
