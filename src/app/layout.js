import "./globals.css";
import { Inter, Urbanist, Sora } from "next/font/google";
import { ThemeProvider } from "./components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})


const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
})

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
})

export const metadata = {
  title: "Marca Aí",
  description: "Encontre profissionais locais e agende atendimentos em minutos.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${urbanist.variable} ${sora.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider>
          <a href="#main-content" className="skip-link">
            Pular para o conteúdo principal
          </a>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
