import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell/AppShell";
import { StoreHydration } from "@/components/providers/StoreHydration";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Pixlanz — tablero, contactos y resultados",
  description:
    "Tablero de producto, contactos con Excel, resultados de visitas y conversión, y código de píxel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${outfit.variable} font-sans`}>
        <StoreHydration>
          <AppShell>{children}</AppShell>
        </StoreHydration>
      </body>
    </html>
  );
}
