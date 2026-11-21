import Link from "next/link";
import { CaretDown } from "@phosphor-icons/react/dist/ssr";
import { NAV } from "@/lib/nav";
import { Logo } from "./Logo";
import { MobileNav } from "./MobileNav";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-night/90 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-[1400px] items-center justify-between px-5 md:px-12">
        <Link href="/" className="flex items-center gap-3 text-xl font-black tracking-tight">
          <Logo className="size-9" />
          Harvest Moon
        </Link>
        <nav aria-label="Principal" className="hidden items-center gap-7 text-sm font-semibold xl:flex">
          {NAV.map((n) =>
            n.children ? (
              // Dropdown is plain HTML shown with CSS, so its links are always in the page for crawlers.
              <div key={n.href} className="group relative">
                <Link href={n.href} className="nav-link flex items-center gap-1 hover:text-accent">
                  {n.label}
                  <CaretDown size={12} weight="bold" aria-hidden className="transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </Link>
                <div className="invisible absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <ul className="min-w-44 border border-line bg-night py-2">
                    {n.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="block px-5 py-2.5 hover:bg-night-2 hover:text-accent">{c.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <Link key={n.href} href={n.href} className="nav-link hover:text-accent">
                {n.label}
              </Link>
            ),
          )}
          <Link href="/contact" className="btn btn-accent h-10 px-4 text-sm">
            Pedir presupuesto
          </Link>
        </nav>
        <MobileNav />
      </div>
    </header>
  );
}
