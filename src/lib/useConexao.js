'use client';

import { useSyncExternalStore } from 'react';

// A-09: estado de conexão do navegador (eventos online/offline).
// `navigator.onLine === false` é certeza de que não há rede; `true` pode ser
// falso positivo (Wi-Fi sem internet) — por isso o envio também tem tempo
// limite e mensagem de demora. No servidor, assume conectado.

function assinar(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function lerNoNavegador() {
  return navigator.onLine;
}

function lerNoServidor() {
  return true;
}

export function useConexao() {
  return useSyncExternalStore(assinar, lerNoNavegador, lerNoServidor);
}
