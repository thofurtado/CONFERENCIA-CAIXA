import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Configuração de Identidade do Sistema
export const metadata: Metadata = {
  title: "Marujo Cash Flow | Eureca Tech",
  description: "Sistema inteligente de conferência de caixa desenvolvido por Thomás Furtado (Eureca Tech) para o cliente Marujo.",
  icons: {
    icon: "/favicon.ico", // O navegador buscará o ícone da âncora aqui
  },
};

// src/app/layout.tsx

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}