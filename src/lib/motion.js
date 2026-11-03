// Espelho, em segundos, dos tokens de motion de src/app/globals.css
// (--duration-* e --ease-*), para o framer-motion usar os mesmos valores
// que o CSS. Mudou um lado, mude o outro.

export const DURACAO = {
  rapida: 0.15, // cor, hover, press, toggle
  base: 0.22,   // entrada pequena: dropdown, toast, troca de painel
  lenta: 0.38,  // bottom sheet, modal (teto ~0.4s)
};

export const CURVA = {
  padrao: [0.4, 0, 0.2, 1],   // mudança de estado
  entrada: [0, 0, 0.2, 1],    // algo aparece
  saida: [0.4, 0, 1, 1],      // algo sai (use ~75% da duração de entrada)
  sheet: [0.32, 0.72, 0, 1],  // bottom sheet, desaceleração longa
};
