export type NavItem = { href: string; label: string; children?: NavItem[] };

// Children render as a dropdown on desktop and indented links on mobile and in the footer.
export const NAV: NavItem[] = [
  { href: "/artistas", label: "Artistas" },
  { href: "/servicios", label: "Servicios", children: [{ href: "/dj-bodas-barcelona", label: "Bodas" }] },
  { href: "/quienes-somos", label: "Quiénes somos" },
  { href: "/playlists", label: "Playlists" },
  { href: "/blog-de-novedades", label: "Blog" },
];

export const SERVICE_PAGES = NAV.find((n) => n.href === "/servicios")?.children ?? [];
