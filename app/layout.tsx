import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Etiquetado Frontal — escaneá los octógonos",
  description: "Escaneá y averiguá qué contienen los alimentos.",
  openGraph: {
    title: "Etiquetado Frontal — escaneá los octógonos",
    description: "Escaneá y averiguá qué contienen los alimentos.",
    locale: "es_AR",
    type: "website",
  },
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
    <html lang="es-AR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
