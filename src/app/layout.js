import "./globals.css";
import { Inter, Urbanist } from "next/font/google";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "./components/theme-provider";
import { ToastProvider } from "./components/ui/ToastProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
})

export const metadata = {
  title: {
    default: "Marca Aí",
    template: "%s | Marca Aí",
  },
  description: "Encontre profissionais locais e agende atendimentos em minutos.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${urbanist.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <MotionConfig reducedMotion="user">
            <ToastProvider>
              <a href="#main-content" className="skip-link">
                Pular para o conteúdo principal
              </a>
              {children}
            </ToastProvider>
          </MotionConfig>
        </ThemeProvider>
      </body>
    </html>
  );
}
