import "./globals.css"
import Header from "../components/Header/Header"
import Footer from "../components/Footer"
import { Providers } from "../components/Header/providers";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex flex-col min-h-screen bg-white  text-black  transition-colors duration-300">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}