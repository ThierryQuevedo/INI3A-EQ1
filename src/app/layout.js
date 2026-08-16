import "./globals.css";
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
    <html lang="pt-BR" className={`${inter.variable} ${urbanist.variable} ${sora.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
