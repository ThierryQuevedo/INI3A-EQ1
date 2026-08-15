// app/(com-header)/layout.js
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default function ComHeaderLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}