import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";

export default function AppLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
