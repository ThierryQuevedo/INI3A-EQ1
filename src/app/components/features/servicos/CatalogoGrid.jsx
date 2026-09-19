"use client";

import { motion, useReducedMotion } from "framer-motion";
import CardServicoCatalogo from "@/app/components/features/servicos/CardServicoCatalogo";

export default function CatalogoGrid({ catalogo }) {
  const reduzMovimento = useReducedMotion();

  if (catalogo.length === 0) {
    return <p className="text-muted-foreground text-body">Nenhum serviço cadastrado no momento.</p>;
  }

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5"
      initial={reduzMovimento ? false : "escondido"}
      animate="visivel"
      variants={{
        visivel: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {catalogo.map((servico) => (
        <motion.div
          key={servico.id}
          className="h-full"
          variants={{
            escondido: { opacity: 0, y: 12 },
            visivel: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.28, 0.11, 0.32, 1] } },
          }}
        >
          <CardServicoCatalogo servico={servico} avaliacao={4.1} />
        </motion.div>
      ))}
    </motion.div>
  );
}
