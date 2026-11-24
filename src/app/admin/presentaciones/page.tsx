import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminTabs } from "@/components/AdminTabs";
import { PresentationEditor } from "@/components/PresentationEditor";
import { getSitePhotos, isPresentationStoreConfigured, loadPresentation } from "@/lib/presentation-store";
import { isQuoteAuthenticated } from "@/lib/quote-auth";

export const metadata: Metadata = {
  title: "Crear presentación",
  robots: { index: false, follow: false },
};

export default async function PresentationAdminPage() {
  if (!(await isQuoteAuthenticated())) redirect("/admin");
  const [boda, tematica] = await Promise.all([loadPresentation("boda"), loadPresentation("tematica")]);

  return (
    <section className="mx-auto w-full max-w-[1100px] px-5 py-12 md:px-12 md:py-20">
      <AdminTabs current="/admin/presentaciones" />
      <div className="mb-10">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Área privada</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight md:text-5xl">Crear presentación</h1>
        <p className="mt-4 max-w-[60ch] leading-relaxed text-muted-2">
          Cambia los textos y las fotos de cada página: sube una foto o elige una de la web. Pulsa «Guardar cambios» para que la próxima vez, y para cualquiera que inicie sesión, la presentación aparezca así.
        </p>
      </div>
      <PresentationEditor
        saved={{ boda, tematica }}
        sitePhotos={getSitePhotos()}
        canSave={isPresentationStoreConfigured()}
      />
    </section>
  );
}
