import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  webpack(config, { isServer, dev }) {
    // En dev, PackFileCacheStrategy échoue à snapshoter certains chemins de résolution
    // (Prisma 7 + serverExternalPackages). Le cache mémoire supprime le warning et
    // fonctionne parfaitement pour HMR/Fast Refresh — seule la persistance entre
    // redémarrages est perdue, ce qui est acceptable en développement.
    if (dev) {
      config.cache = { type: "memory" };
    }

    if (isServer) {
      // Traiter les imports node: préfixés (Prisma 7) comme externals CommonJS.
      // Évite que webpack essaie de les bundler et de les snapshoter en build.
      const existingExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
        ? [config.externals]
        : [];

      const NODE_BUILTINS = ["crypto", "fs", "path", "os", "url", "module", "process"];

      config.externals = [
        ...existingExternals,
        (
          { request }: { request?: string },
          callback: (err?: null, result?: string) => void
        ) => {
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
