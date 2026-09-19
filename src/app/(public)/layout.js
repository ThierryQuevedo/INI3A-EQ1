import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import PageTransition from "@/app/components/ui/PageTransition";

export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main id="main-content" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
