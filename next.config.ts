import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // PDF.js configuration for client-side builds
    if (!isServer) {
      // Configure fallbacks for Node.js modules
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
        util: false,
        assert: false,
        events: false,
        net: false,
        tls: false,
        child_process: false,
      };

      // Add aliases to prevent problematic modules from being bundled
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        jsdom: false,
        "pdfjs-dist/build/pdf.worker.js": false,
      };

      // Use IgnorePlugin to ignore problematic modules
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(canvas|jsdom|fs)$/,
        })
      );

      // Handle pdfjs-dist worker issues
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /pdfjs-dist\/build\/pdf\.worker\.js/,
          require.resolve("pdfjs-dist/build/pdf.worker.min.js")
        )
      );
    }

    // For server-side builds, we need to handle these modules differently
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        jsdom: false,
      };
    }

    return config;
  },

  // Disable server-side rendering for PDF-related components
  experimental: {
    esmExternals: "loose",
  },
};

export default nextConfig;
