import type { Metadata } from "next";
import Link from "next/link";
import { ADMIN_TOOLS, LogoutButton } from "@/components/AdminTabs";
import { isQuoteAuthenticated, isQuoteAuthConfigured } from "@/lib/quote-auth";
import { loginQuoteAdmin } from "./actions";

export const metadata: Metadata = {
  title: "Área privada",
  robots: { index: false, follow: false },
};

const inputClass =
  "w-full border border-line bg-night-2 px-4 py-3 text-paper placeholder:text-muted focus:border-accent focus:outline-none transition-colors";

export default async function AdminPage({ searchParams }: PageProps<"/admin">) {
  const [{ error }, authenticated] = await Promise.all([searchParams, isQuoteAuthenticated()]);

  if (authenticated) {
    return (
      <section className="mx-auto w-full max-w-[1100px] px-5 py-12 md:px-12 md:py-20">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Área privada</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">¿Qué quieres crear?</h1>
          </div>
          <LogoutButton />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {ADMIN_TOOLS.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group border border-line bg-night-2/60 p-7 transition-colors hover:border-accent focus-visible:border-accent focus-visible:outline-none md:p-9"
            >
              <h2 className="text-2xl font-black tracking-tight group-hover:text-accent md:text-3xl">{tool.label}</h2>
              <p className="mt-3 leading-relaxed text-muted-2">{tool.description}</p>
              <span aria-hidden="true" className="mt-6 inline-block text-sm font-bold uppercase tracking-[0.14em] text-accent">
                Crear →
              </span>
            </Link>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[560px] px-5 py-16 md:px-12 md:py-24">
      <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Área privada</p>
      <h1 className="mt-3 text-4xl font-black tracking-tight">Iniciar sesión</h1>
      <p className="mt-4 leading-relaxed text-muted-2">
        Inicia sesión para crear presupuestos y presentaciones para clientes.
      </p>

      {!isQuoteAuthConfigured() ? (
        <div className="mt-8 border border-accent/50 bg-night-2 p-5 text-sm leading-relaxed text-muted-2">
          Configura <code className="text-paper">QUOTE_ADMIN_USERNAME</code>,{" "}
          <code className="text-paper">QUOTE_ADMIN_PASSWORD</code> (mínimo 12 caracteres) y{" "}
          <code className="text-paper">QUOTE_SESSION_SECRET</code> (mínimo 32 caracteres) en el entorno del servidor para habilitar el acceso.
        </div>
      ) : (
        <form action={loginQuoteAdmin} className="mt-8 grid gap-5">
          {error === "invalid" && (
            <p role="alert" className="border border-red-400 px-4 py-3 text-sm text-red-300">
              Usuario o contraseña incorrectos.
            </p>
          )}
          {error === "setup" && (
            <p role="alert" className="border border-red-400 px-4 py-3 text-sm text-red-300">
              El acceso no está configurado correctamente en el servidor.
            </p>
          )}
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-semibold">Usuario</label>
            <input id="username" name="username" autoComplete="username" required maxLength={128} className={inputClass} />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-semibold">Contraseña</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="remember" />
            Recuérdame
          </label>
          <button type="submit" className="btn btn-accent justify-self-start">Iniciar sesión</button>
        </form>
      )}
    </section>
  );
}
