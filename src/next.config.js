import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

// Fixa a raiz do Turbopack nesta pasta: o servidor de produção tem um
// package-lock.json residual um nível acima (fora do repo), o que faz o
// Next inferir a raiz errada e quebrar a resolução dos imports "@/...".
const __dirname = dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  basePath: '/26-marcaai',
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
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
