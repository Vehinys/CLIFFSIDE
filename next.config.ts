import type { NextConfig } from "next";

// Modules Node.js built-ins référencés avec le préfixe node: par Prisma 7.
// Traités comme externals (pas de bundling) plutôt que via resolve.alias,
// ce qui évite l'erreur "Unable to snapshot resolve dependencies" du cache webpack.
const NODE_BUILTINS = ["crypto", "fs", "path", "os", "url", "module", "process"] as const;

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  webpack(config, { isServer }) {
    if (isServer) {
      const existingExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
        ? [config.externals]
        : [];

      config.externals = [
        ...existingExternals,
        ({ request }: { request?: string }, callback: (err?: null, result?: string) => void) => {
          if (request && NODE_BUILTINS.some((m) => request === `node:${m}`)) {
            callback(null, `commonjs ${request.slice(5)}`);
            return;
          }
          callback();
        },
      ];
    }
    return config;
  },
};

export default nextConfig;
