import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminTabs } from "@/components/AdminTabs";
import { QuoteEditor } from "@/components/QuoteEditor";
import { getSite } from "@/lib/content";
import { isQuoteAuthenticated } from "@/lib/quote-auth";

export const metadata: Metadata = {
  title: "Crear presupuesto",
  robots: { index: false, follow: false },
};

export default async function QuoteAdminPage() {
  if (!(await isQuoteAuthenticated())) redirect("/admin");
  const site = getSite();

  return (
    <section className="mx-auto w-full max-w-[1100px] px-5 py-12 md:px-12 md:py-20">
      <AdminTabs current="/admin/presupuestos" />
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Área privada</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Crear presupuesto</h1>
        <p className="mt-4 max-w-[60ch] leading-relaxed text-muted-2">
          Completa los datos del evento y las opciones. El PDF se descargará en este dispositivo; los borradores no se guardan en el servidor.
        </p>
      </div>
      <QuoteEditor
        company={{
          name: site.name,
          email: site.email,
          phone: site.phone,
          address: site.address,
        }}
      />
    </section>
  );
}
