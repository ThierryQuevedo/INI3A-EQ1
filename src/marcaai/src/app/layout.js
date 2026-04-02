import "./globals.css"
import Header from "../components/Header"
import Footer from "../components/Footer"
export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            {children}
            </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}