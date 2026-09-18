import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Blog cover + inline images are hosted on UploadThing. Newer SDKs serve from
    // <appId>.ufs.sh; older URLs use utfs.io. Allow both for next/image.
    remotePatterns: [
      { protocol: "https", hostname: "*.ufs.sh", pathname: "/f/**" },
      { protocol: "https", hostname: "utfs.io", pathname: "/f/**" },
    ],
  },
};

export default nextConfig;
