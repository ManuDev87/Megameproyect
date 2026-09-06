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
  title: "Megame — proyectos tecnológicos",
  description:
    "Tablero de producto, seguimiento de lanzamiento con importación Excel y píxeles de marketing.",
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
