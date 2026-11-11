'use client';

import { useSyncExternalStore } from 'react';

// estado de conexao do navegador

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
