import "./globals.css"
import Header from "../components/Header/Header"
import Footer from "../components/Footer"
import { Inter, Urbanist, Sora } from "next/font/google"

// 1. Configura a Inter
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// 2. Configura a Urbanist
const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
})

// 3. Configura a Sora
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
})

export const metadata = {
  title: "Meu Projeto Next.js",
}

export default function RootLayout({ children }) {
  return (

    <html 
      lang="pt-br" 
      suppressHydrationWarning 
      className={`${inter.variable} ${urbanist.variable} ${sora.variable}`}
    >
      <body className="font-sans antialiased">
        <div className="flex flex-col min-h-screen bg-white text-black transition-colors duration-300">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}