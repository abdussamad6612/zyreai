import { cloudflareDevProxyVitePlugin as remixCloudflareDevProxy, vitePlugin as remixVitePlugin } from '@remix-run/dev';
import UnoCSS from 'unocss/vite';
import { defineConfig, type ViteDevServer } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { optimizeCssModules } from 'vite-plugin-optimize-css-modules';
import tsconfigPaths from 'vite-tsconfig-paths';

const isVercel = process.env.VERCEL === '1';

export default defineConfig((config) => {
  return {
    build: {
      target: 'esnext',
    },
    server: {
      port: 5000,
      host: '0.0.0.0',
      allowedHosts: true,
      cors: true,
      headers: {
        'X-Frame-Options': 'ALLOWALL',
        'Content-Security-Policy': "frame-ancestors *",
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Embedder-Policy': 'unsafe-none',
        'Cross-Origin-Opener-Policy': 'unsafe-none',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
      watch: {
        ignored: [
          '**/.local/**',
          '**/node_modules/**',
          '**/.git/**',
          '**/mobile/**',
        ],
      },
    },
    ssr: {
      noExternal: ['lucide-react'],
      ...(isVercel ? { target: 'node' } : {}),
    },
    optimizeDeps: {
      include: ['lucide-react'],
    },
    plugins: [
      nodePolyfills({
        include: ['path', 'buffer', 'crypto'],
        globals: { crypto: true },
      }),
      // Skip Cloudflare dev proxy on Vercel and in test mode
      !isVercel && config.mode !== 'test' && remixCloudflareDevProxy(),
      remixVitePlugin({
        future: {
          v3_fetcherPersist: true,
          v3_relativeSplatPath: true,
          v3_throwAbortReason: true,
        },
        ...(isVercel ? {
          serverBuildFile: 'index.js',
        } : {}),
      }),
      UnoCSS(),
      tsconfigPaths(),
      iframeHeadersPlugin(),
      config.mode === 'production' && optimizeCssModules({ apply: 'build' }),
    ],
  };
});

function iframeHeadersPlugin() {
  return {
    name: 'iframe-headers',
    configureServer(server: ViteDevServer) {
      server.middlewares.use((req, res, next) => {
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        res.setHeader('Content-Security-Policy', "frame-ancestors *");
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-store');
        res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
        res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

        const raw = req.headers['user-agent']?.match(/Chrom(e|ium)\/([0-9]+)\./);
        if (raw) {
          const version = parseInt(raw[2], 10);
          if (version === 129) {
            res.setHeader('content-type', 'text/html');
            res.end('<body><h1>Please use Chrome Canary for testing.</h1></body>');
            return;
          }
        }

        next();
      });
    },
  };
}
