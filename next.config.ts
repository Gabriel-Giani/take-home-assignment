import type { NextConfig } from "next";
import webpack from "webpack";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // PDF.js fix for serverless deployment
    if (!isServer) {
      // Add alias to redirect canvas to false
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
        jsdom: false,
      };

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
      };

      // Use IgnorePlugin to ignore canvas and other Node.js modules
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^(canvas|jsdom)$/,
        })
      );
    }

    return config;
  },
};

export default nextConfig;
