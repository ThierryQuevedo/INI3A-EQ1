import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
