/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
  async redirects() {
    return [
      {
        // `/ministerios` pasó a ser `/the-chosen`. La redirección es
        // permanente para que los buscadores trasladen lo que ya tenían
        // indexado, y para que un link ya compartido siga funcionando en vez
        // de caer en el 404.
        //
        // `permanent: true` emite 308, no 301. Los dos son permanentes para
        // los buscadores; 308 además obliga a conservar el método HTTP.
        source: "/ministerios",
        destination: "/the-chosen",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
