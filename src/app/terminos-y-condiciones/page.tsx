import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Términos y condiciones", robots: { index: false } };

export default function Page() {
  return <LegalPage name="terminos" />;
}
