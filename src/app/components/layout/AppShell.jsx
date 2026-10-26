import Header from "./Header";
import Footer from "./Footer";
import BottomNav from "./BottomNav";
import PageTransition from "@/app/components/ui/PageTransition";
import { getSession } from "@/app/actions/auth.actions";

export default async function AppShell({ children }) {
  const usuario = await getSession();

  // No mobile a BottomNav (h-16 + safe-area) é fixa: o padding fica no
  // wrapper — e não no <main> — para que o Footer também termine acima
  // dela e "Sobre"/"Termos" continuem clicáveis.
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
      <Header usuario={usuario} />
      <main id="main-content" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <BottomNav usuario={usuario} />
    </div>
  );
}
