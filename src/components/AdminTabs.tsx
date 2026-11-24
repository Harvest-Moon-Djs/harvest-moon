import Link from "next/link";
import { logoutQuoteAdmin } from "@/app/admin/actions";

export const ADMIN_TOOLS = [
  {
    href: "/admin/presupuestos",
    label: "Presupuestos",
    description: "Prepara un presupuesto con opciones y precios para un cliente.",
  },
  {
    href: "/admin/presentaciones",
    label: "Presentaciones",
    description: "Personaliza los textos y fotos de la presentación de Harvest Moon.",
  },
] as const;

export function LogoutButton() {
  return (
    <form action={logoutQuoteAdmin}>
      <button type="submit" className="btn btn-ghost">Cerrar sesión</button>
    </form>
  );
}

/** Switch between the private tools, go back to /admin, or log out. */
export function AdminTabs({ current }: { current: (typeof ADMIN_TOOLS)[number]["href"] }) {
  return (
    <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <nav aria-label="Área privada" className="flex flex-wrap gap-6 text-sm font-bold uppercase tracking-[0.14em]">
        <Link href="/admin" className="text-muted-2 hover:text-paper">Inicio</Link>
        {ADMIN_TOOLS.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            aria-current={tool.href === current ? "page" : undefined}
            className={tool.href === current ? "text-accent" : "text-muted-2 hover:text-paper"}
          >
            {tool.label}
          </Link>
        ))}
      </nav>
      <LogoutButton />
    </div>
  );
}
