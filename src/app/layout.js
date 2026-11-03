import "./globals.css";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "./components/theme-provider";
import { ToastProvider } from "./components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Títulos: só o peso 700 (woff2 oficial da Fontshare, licença ITF FFL v2.0 —
// não pode ser subsetado nem convertido). Ver src/app/fonts/LEIA-ME.md.
const satoshi = localFont({
  src: "./fonts/Satoshi-Bold.woff2",
  weight: "700",
  style: "normal",
  display: "swap",
  variable: "--font-satoshi",
  adjustFontFallback: "Arial",
})

// A-12 (mobile-native §7 e §10): a página vai até as bordas (notch, barra
// de gestos) e cada componente fixo se afasta com env(safe-area-inset-*) —
// sem viewport-fit=cover esses valores são 0. O teclado do Android encolhe
// o layout (interactive-widget), como no iPhone. Zoom NUNCA é bloqueado.
// theme-color segue o tema do sistema; a cor é a do header (bg-card).
export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#141F2D" },
  ],
}

export const metadata = {
  title: {
    default: "Marca Aí",
    template: "%s | Marca Aí",
  },
  description: "Encontre profissionais locais e agende atendimentos em minutos.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${satoshi.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <ToastProvider>
            <a href="#main-content" className="skip-link">
              Pular para o conteúdo principal
            </a>
            {children}
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
