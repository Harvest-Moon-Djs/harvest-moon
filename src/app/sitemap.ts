import type { MetadataRoute } from "next";
import { SITE_URL as BASE, getArtists, getPosts } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const fixed = ["", "/dj-bodas-barcelona", "/artistas", "/servicios", "/quienes-somos", "/playlists", "/blog-de-novedades", "/contact"];
  return [
    ...fixed.map((p) => ({ url: BASE + p, changeFrequency: "monthly" as const, priority: p === "" ? 1 : p === "/dj-bodas-barcelona" ? 0.9 : 0.7 })),
    ...getArtists().map((a) => ({ url: `${BASE}/artistas/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...getPosts().map((p) => ({ url: `${BASE}/blog-de-novedades/${p.slug}`, lastModified: p.date, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
