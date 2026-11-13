import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { CAMINHO_BASE } from './lib/caminhoBase.js';

// fixa a raiz do turbopack
const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  basePath: CAMINHO_BASE,
  trailingSlash: true,
  turbopack: {
    root: __dirname,
  },
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'utfs.io', port: '', pathname: '/**' },
      { protocol: 'https', hostname: 'yexqwi4vi7.ufs.sh', port: '', pathname: '/**' },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactCompiler: true,
  experimental: {
    // libera forbidden
    authInterrupts: true,
    // foto do servico vira data URL base64 (~33% maior) dentro do FormData da action
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Cabeçalhos de segurança em todas as respostas. A CSP fica só nas diretivas
  // que não dependem dos scripts inline do Next (bloqueia iframe de terceiros,
  // <base> e <object>); uma CSP de script-src exigiria nonce em cada página.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
        ],
      },
    ];
  },
};

export default nextConfig;
