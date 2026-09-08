/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/26-marcaai',
  trailingSlash: true, 
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos", port: "", pathname: "/**" },
      { protocol: "https", hostname: "utfs.io", port: "", pathname: "/**" },
      { protocol: "https", hostname: "yexqwi4vi7.ufs.sh", port: "", pathname: "/**" },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;