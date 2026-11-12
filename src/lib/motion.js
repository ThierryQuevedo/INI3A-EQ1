// espelho dos tokens de motion do globals css

export const DURACAO = {
  rapida: 0.15, // cor hover press toggle
  base: 0.22,   // entrada pequena
  lenta: 0.38,  // sheet e modal
};

export const CURVA = {
  padrao: [0.4, 0, 0.2, 1],   // mudanca de estado
  entrada: [0, 0, 0.2, 1],    // algo aparece
  saida: [0.4, 0, 1, 1],      // algo sai
  sheet: [0.32, 0.72, 0, 1],  // desaceleracao longa
};
