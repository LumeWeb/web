import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { siaStorage } from "@siafoundation/sia-storage/vite";
import { defineConfig } from "vite";

// The workspace lib ships pre-compiled JSX; running the fast-refresh transform
// over its dist emits a bare RefreshSig reference with no runtime in scope, so
// the wrapper never evaluates. Keep the Sia lib out of the transform.
export default defineConfig(({ mode }) => {
  // Debug builds (vite build --mode debug) are a config/script-only debugging
  // aid: they emit an unminified bundle where React resolves to its development
  // build, so runtime errors such as update-depth carry full dev messages and
  // stack traces. Normal `vite build` (mode production) is unchanged.
  const isDebug = mode === "debug";
  if (isDebug) {
    // The build command normally boots with NODE_ENV=production. Forcing the
    // dev value here makes Vite/plugin-react treat this as a non-production
    // build (config.isProduction, import.meta.env.DEV/PROD) even though the
    // mode is a custom "debug" rather than "development".
    process.env.NODE_ENV = "development";
  }

  return {
    plugins: [
      react({
        exclude: /sia-video-source\/dist\//,
      }),
      // Serves the SDK's streaming service worker in dev, emits it in build,
      // and excludes the SDK's WASM from dependency pre-bundling.
      siaStorage(),
      tailwindcss(),
    ],
    server: {
      port: 5180,
      strictPort: true,
    },
    preview: {
      port: 4180,
      strictPort: true,
      // The piko tunnel proxies the preview under {endpoint}.tunnel.pinner.xyz;
      // Vite's default host allow-list rejects that Host header, so allow it.
      allowedHosts: [".tunnel.pinner.xyz"],
    },
    ...(isDebug
      ? {
          // Debug-only overrides: React 19 selects its dev/prod build at bundle
          // time via replaced `process.env.NODE_ENV`, so pin it explicitly (user
          // define wins over Vite's internal define). Keep debug output in its
          // own dist dir so it never clobbers the production `dist`.
          build: {
            outDir: "dist-debug",
            minify: false,
          },
          define: {
            "process.env.NODE_ENV": JSON.stringify("development"),
          },
        }
      : {}),
  };
});
