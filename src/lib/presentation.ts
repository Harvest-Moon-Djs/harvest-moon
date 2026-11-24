// Shared by the presentation editor (client) and the PDF route (server).
// Default copy comes from texts/texts.md; the two templates match texts/Harvest-Moon-presentacion-{boda,tematica}.pdf.
// Photos live under public/media and must be listed in outputFileTracingIncludes in next.config.ts.

export type PresentationBlock = { title: string; text: string };

export type PresentationPage = {
  photo: string;
  /** Label in the band over the photo ("NUESTRA HISTORIA"). Unused on the cover. */
  section: string;
  /** Small accent line above the first title ("01 / TRAYECTORIA"). */
  eyebrow: string;
  blocks: PresentationBlock[];
};

export const PRESENTATION_PAGE_NAMES = ["Portada", "Página 2", "Página 3", "Página 4", "Página 5"];
export const MAX_BLOCKS = 4;
export const LIMITS = { section: 60, eyebrow: 80, title: 160, text: 1500, photo: 200 };
export const MAX_PHOTO_BYTES = 3 * 1024 * 1024;

const BODA_PAGES: PresentationPage[] = [
  {
    photo: "/media/presentacion/portada.jpg",
    section: "",
    eyebrow: "PRESENTACIÓN  /  BODAS Y EVENTOS",
    blocks: [
      {
        title: "Somos una nueva agencia de DJs.",
        text: "DJs con experiencia en centenares de bodas. La boda de los reyes Holanda. Compositores y productores musicales con lanzamientos en vinilo. Giras por países de Europa y América Latina. Conoce la trayectoria de nuestro fundador con la música y conoce cómo trabajaremos juntos, si nos elegís, en la planificación musical de tu boda.",
      },
    ],
  },
  {
    photo: "/media/pages/bodas/mesa-velas.jpg",
    section: "NUESTRA HISTORIA",
    eyebrow: "01  /  TRAYECTORIA",
    blocks: [
      {
        title: "Amor por la musica con 30 años de trayectoria.",
        text: "Rodrigo comienza en Argentina. A sus 15 años entra a trabajar como DJ de bodas en la empresa Repila, la mas importante del rubro en su país. Y así fue DJ en mas de 800 bodas y fiestas empresariales. Paralelamente lanzaba su carrera como DJ de fiestas electronicas, con lo que llega a poner música en discotecas en todo latinoamerica y luego hace giras por europa. Berlin, Paris, Zurich, Barcelona, Koln, y Madrid.",
      },
      {
        title: "Una boda real",
        text: "Viviendo en Argentina, Rodrigo fue contratado por la realeza. En 2002, en el palacio Alberg Cobo, se celebro un festín intimo por la unión entre Máxima y el entonces Principe de Holanda, Guillermo. Rodrigo fue Disk Jockey de los actuales reyes de Holanda.",
      },
    ],
  },
  {
    photo: "/media/pages/bodas/baile-novios.jpg",
    section: "MÚSICA Y CREACIÓN",
    eyebrow: "02  /  UNA VIDA ENTRE DISCOS Y EVENTOS",
    blocks: [
      {
        title: "Como compositor y productor",
        text: 'Fue co-fundador de sellos discograficos: Future Tone Records y Sweet Noise. Tiene 7 discos con temas propios editados en vinilo. Algunos lanzamientos pueden escucharse bajo su nombre como compositor: "On Jet Lag".',
      },
      {
        title: "Fundación y lanzamiento de Harvest Moon",
        text: "En el año 2012 se muda a Barcelona en donde monta un restaurante de bagels. The Bagel Hood. Hoy en dia es un obrador de bagels y panes artesanales que distribuye en toda España. En el año 2026 se reconecta con su pasión, la música, y junto a su socio arma un equipo y crea Harvest Moon.",
      },
    ],
  },
  {
    photo: "/media/pages/bodas/novia-pista.jpg",
    section: "LA FIESTA",
    eyebrow: "",
    blocks: [
      {
        title: "Nosotros no vamos a musicalizar una reunión. Te presentamos DJs que lo que saben hacer es otra cosa; que una unión sea una fiesta.",
        text: "",
      },
      {
        title: "Tus invitados bailando = nuestra garantia",
        text: "Algo fundamental en una celebración familiar como una boda o en cualquier evento social festivo es que todos los invitados bailen y se diviertan. Para eso la selección musical es super importante, pero no es lo único. El buen DJ busca seguir el camino que dicta el ánimo de la pista para ir poniendo la muisca que divierte y une a todos. Cada canción tiene su momento indicado para sonar. Saber leer esos momentos es clave para que todos tus invitados se sientan parte de la misma fiesta. Y eso lo sabemos hacer.",
      },
    ],
  },
  {
    photo: "/media/presentacion/they-did-it.jpg",
    section: "NUESTRA MANERA DE TRABAJAR",
    eyebrow: "03  /  CADA FIESTA TIENE SU PROPIA IDENTIDAD",
    blocks: [
      {
        title: "Nuestro estilo = tu estilo",
        text: "Somos amantes de la música que viene del corazón. Sonidos internacionales, clásicos de los 70s, 80s, 90s. Rock, Indie, música electrónica y Pop. Nuestras sesiones son la combinación de tus gustos, nuestra experiencia y lo que demanda la pista de baile momento a momento en cada etapa de la fiesta.",
      },
      {
        title: "De principio a fin",
        text: "Estamos contigo en cada paso del camino, desde la primer reunión donde conocemos tus gustos y juntos imaginamos tu fiesta, hasta el día del gran acontecimiento. Te acomañamos en la planificación escuchandote y aportando sugerencias para un evento dinámico y entretenido, ayudándote a definir cada detalle. El día del evento, nuestro equipo técnico estará a tu disposición cuidando de cada aspecto de las instalaciones para que todo esté impecable y listo para que disfrutes de una noche sin contratiempos ni nada por lo que preocuparte.",
      },
    ],
  },
];

export type CoverLayout = "full" | "half";

export const PRESENTATION_TEMPLATES = {
  boda: { label: "Boda", cover: "full" as CoverLayout, pages: BODA_PAGES },
  // Same copy, different photos, and the photo fills only the bottom half of the cover.
  tematica: {
    label: "Temática",
    cover: "half" as CoverLayout,
    pages: BODA_PAGES.map((page, i) => ({
      ...page,
      photo: [
        "/media/presentacion/tematica-portada.jpg",
        "/media/presentacion/tematica-historia.jpg",
        "/media/pages/evento-noche.jpg",
        "/media/presentacion/tematica-fiesta.jpg",
        page.photo,
      ][i],
    })),
  },
};

export type PresentationTemplate = keyof typeof PRESENTATION_TEMPLATES;
export const DEFAULT_PRESENTATION = BODA_PAGES;

// A page photo is either a site photo ("/media/...") or an uploaded one, stored privately in
// Vercel Blob under UPLOAD_PREFIX and served to logged-in users by /admin/api/presentacion/foto.
export const UPLOAD_PREFIX = "presentaciones/fotos/";
export const UPLOADED_PHOTO = /^presentaciones\/fotos\/[a-f0-9-]{36}\.(jpg|png)$/;

export function photoSrc(photo: string) {
  return photo.startsWith("/media/") ? photo : `/admin/api/presentacion/foto?p=${encodeURIComponent(photo)}`;
}
