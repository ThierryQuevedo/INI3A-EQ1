"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const TRANSICAO = { duration: 0.22, ease: [0.28, 0.11, 0.32, 1] };

export default function PageTransition({ children }) {
  const pathname = usePathname();
  const reduzMovimento = useReducedMotion();

  // A estrutura é sempre a mesma (motion.div) — só a animação é zerada com
  // movimento reduzido. Trocar por `children` puro quebrava a hidratação,
  // porque no servidor useReducedMotion() ainda não sabe a preferência.
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduzMovimento ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduzMovimento ? undefined : { opacity: 0, y: -8 }}
        transition={reduzMovimento ? { duration: 0 } : TRANSICAO}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
