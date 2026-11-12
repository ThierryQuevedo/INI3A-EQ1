import "./globals.css";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "./components/theme-provider";
import { ToastProvider } from "./components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// titulos so no peso 700 e a licenca nao permite subset
const satoshi = localFont({
  src: "./fonts/Satoshi-Bold.woff2",
  weight: "700",
  style: "normal",
  display: "swap",
  variable: "--font-satoshi",
  adjustFontFallback: "Arial",
})

// viewport ate as bordas e zoom nunca bloqueado
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
