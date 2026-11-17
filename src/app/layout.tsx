import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth/presentation";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "StockPyme",
    template: "%s · StockPyme",
  },
  description: "Inventario y ventas para pequeños negocios.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
