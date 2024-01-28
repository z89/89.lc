/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ipgeolocation.io",
        port: "",
        pathname: "/static/**",
      },
    ],
  },
};

export default nextConfig;
