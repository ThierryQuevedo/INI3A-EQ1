import "../globals.css";
import { Inter, Urbanist, Sora } from "next/font/google";

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
          <main className="flex-1">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}