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
  // libera forbidden
  experimental: {
    authInterrupts: true,
  },
};

export default nextConfig;
