import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingIncludes: {
    "/admin/api/presupuesto": [
      "./public/media/pages/bodas/novios-mesa.jpg",
      "./public/media/pages/bodas/mesa-flores.jpg",
      "./public/media/pages/bodas/baile-novios.jpg",
      "./public/media/pages/bodas/giro-novios.jpg",
      "./public/media/pages/bodas/beso-pista.jpg",
      "./public/media/pages/eventos/*.jpg",
      "./public/symbol.svg",
    ],
    // Default photos from DEFAULT_PRESENTATION in src/lib/presentation.ts.
    "/admin/api/presentacion": [
      "./public/media/presentacion/*.jpg",
      "./public/media/pages/bodas/mesa-velas.jpg",
      "./public/media/pages/bodas/baile-novios.jpg",
      "./public/media/pages/bodas/novia-pista.jpg",
      "./public/media/pages/evento-noche.jpg",
      "./src/lib/fonts/Archivo-Black.ttf",
    ],
  },
  async redirects() {
    return [
      // Old Squarespace blog URLs
      { source: "/lo-mas-importante-de-una-boda/:path*", destination: "/blog-de-novedades", permanent: true },
      { source: "/blog-de-novedades/blog-post-title-one-j3n87", destination: "/blog-de-novedades/lo-mas-importante-de-una-boda", permanent: true },
      { source: "/blog-de-novedades/blog-post-title-two-awgyd", destination: "/blog-de-novedades/el-mejor-sitio-para-tu-boda", permanent: true },
      { source: "/blog-de-novedades/blog-post-title-three-t7ct8", destination: "/blog-de-novedades/tecnologia-en-bodas-y-eventos", permanent: true },
      { source: "/blog-de-novedades/blog-post-title-four-wca7a", destination: "/blog-de-novedades/bodas-tematicas", permanent: true },
      { source: "/cart", destination: "/", permanent: true },
      { source: "/about", destination: "/servicios", permanent: true },
    ];
  },
};

export default nextConfig;
