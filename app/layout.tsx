import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const serif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? new URL(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    : new URL("http://localhost:3000");

const TITLE = "Etiquetado Frontal Argentina — escaneá los octógonos | Ley 27.642";
const DESCRIPTION =
  "Subí la foto de la tabla nutricional de cualquier envase argentino y descubrí qué octógonos le corresponden según la Ley 27.642 y el Decreto 151/2022. Gratis, sin registro, basado en el perfil OPS.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: TITLE,
    template: "%s · Etiquetado Frontal",
  },
  description: DESCRIPTION,
  applicationName: "Etiquetado Frontal",
  authors: [{ name: "Rodolfo Pardo", url: "https://cafecito.app/rodolofpardo" }],
  creator: "Rodolfo Pardo",
  keywords: [
    "Ley 27.642",
    "etiquetado frontal Argentina",
    "octógonos negros",
    "perfil OPS",
    "Decreto 151/2022",
    "alimentación saludable",
    "exceso de azúcar",
    "exceso de sodio",
    "exceso de grasas",
    "ultraprocesados",
    "lectura de etiquetas",
    "información nutricional",
  ],
  category: "health",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    locale: "es_AR",
    type: "website",
    siteName: "Etiquetado Frontal",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    creator: "@rodypardo",
  },
  verification: GSC_VERIFICATION
    ? { google: GSC_VERIFICATION }
    : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl.origin}/#website`,
      url: siteUrl.origin,
      name: "Etiquetado Frontal Argentina",
      description: DESCRIPTION,
      inLanguage: "es-AR",
      publisher: { "@id": `${siteUrl.origin}/#person` },
    },
    {
      "@type": "WebApplication",
      "@id": `${siteUrl.origin}/#app`,
      name: "Etiquetado Frontal Argentina",
      url: siteUrl.origin,
      description: DESCRIPTION,
      applicationCategory: "HealthApplication",
      operatingSystem: "Web",
      browserRequirements: "Requires JavaScript",
      offers: { "@type": "Offer", price: "0", priceCurrency: "ARS" },
      inLanguage: "es-AR",
      isAccessibleForFree: true,
      featureList: [
        "Escaneo de tablas nutricionales con IA",
        "Cálculo determinista de octógonos según perfil OPS",
        "Detección de exenciones del Decreto 151/2022",
        "Leyendas de edulcorantes y cafeína",
      ],
    },
    {
      "@type": "Person",
      "@id": `${siteUrl.origin}/#person`,
      name: "Rodolfo Pardo",
      url: "https://cafecito.app/rodolofpardo",
    },
  ],
};

export const viewport: Viewport = {
  themeColor: "#fafaf9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es-AR" className={`${inter.variable} ${serif.variable}`}>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <body className="min-h-screen antialiased font-sans">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
