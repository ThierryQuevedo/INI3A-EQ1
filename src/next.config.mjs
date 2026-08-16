/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  devIndicators:{
    appIsrStatus: false,
    buildActivity: false,
  },
  images:{
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
        pathname: "/**"
      },
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
        pathname: "/**"
      },
    ],
  },
  reactCompiler: true,
};

export default nextConfig;
