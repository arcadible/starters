// Relative paths, and the build goes where arcadible.toml's deploy_dir
// expects it. Game engines are larger than Vite's 500 kB warning, which is
// meant for websites. Both servers send Arcadible's isolation headers, so the
// game is cross-origin isolated, as on Arcadible, and `arc serve --url` can
// frame the dev server.
const headers = {
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Resource-Policy": "cross-origin",
};

export default {
  base: "./",
  build: { chunkSizeWarningLimit: 2048, outDir: ".arcadible-public" },
  preview: { headers },
  server: { headers },
};
