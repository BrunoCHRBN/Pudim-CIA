import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pudim-cia.vercel.app"),
  title: "Pudim & CIA — Doceria Artesanal",
  description:
    "Acolhimento e sabor artesanal em cada detalhe. Encomende pudins clássicos, cones trufados e trufas gourmet em Araraquara.",
  openGraph: {
    type: "website",
    siteName: "Pudim & CIA",
    title: "Pudim & CIA — Doceria Artesanal",
    description:
      "Acolhimento e sabor artesanal em cada detalhe. Encomende pudins clássicos, cones trufados e trufas gourmet em Araraquara.",
    locale: "pt_BR",
    images: [
      {
        url: "/assets/pudim_classico.png",
        width: 800,
        height: 600,
        alt: "Pudim Clássico de Leite Moça",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pudim & CIA — Doceria Artesanal",
    description:
      "Acolhimento e sabor artesanal em cada detalhe. Encomende via WhatsApp.",
    images: ["/assets/pudim_classico.png"],
  },
  icons: {
    icon: [
      { url: "/assets/favicon.ico", sizes: "any" },
      { url: "/assets/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/assets/favicon-16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: "/assets/apple-touch-icon.png",
  },
};

import { CartProvider } from "@/context/CartContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${jakarta.variable}`}>
      <body style={{ fontFamily: "var(--font-sans)" }}>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
