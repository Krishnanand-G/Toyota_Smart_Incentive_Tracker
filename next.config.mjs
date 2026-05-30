/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "toyota-cms.s3.amazonaws.com" },
      { protocol: "https", hostname: "static3.toyotabharat.com" },
      { protocol: "https", hostname: "*.toyotabharat.com" },
      { protocol: "https", hostname: "imgd.aeplcdn.com" },
      { protocol: "https", hostname: "stimg.cardekho.com" },
      { protocol: "https", hostname: "*.cardekho.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
    ],
  },
};

export default nextConfig;
