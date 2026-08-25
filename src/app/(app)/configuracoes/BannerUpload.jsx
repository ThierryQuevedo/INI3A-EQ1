"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { UploadDropzone } from "@uploadthing/react";

export default function BannerUpload({ usuario }) {
  const [mostrarUpload, setMostrarUpload] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(usuario.urlBanner || null);

  return (
    <div className="relative w-full">
      <div className="w-full h-40 bg-muted rounded-2xl overflow-hidden flex items-center justify-center relative group border border-border">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Banner do perfil" className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted-foreground text-body-sm">Sem banner (1200x400)</span>
        )}

        <button
          type="button"
          onClick={() => setMostrarUpload(true)}
          aria-label="Alterar banner do perfil"
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center justify-center"
        >
          <Pencil className="text-white" aria-hidden="true" />
        </button>
      </div>

      {mostrarUpload && (
        <div role="dialog" aria-label="Enviar novo banner" className="mt-3 bg-card p-4 rounded-xl shadow-elevated border border-border flex flex-col items-center w-full">
          <button
            type="button"
            onClick={() => setMostrarUpload(false)}
            aria-label="Fechar"
            className="self-end h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive mb-2 transition-colors cursor-pointer"
          >
            <X size={20} aria-hidden="true" />
          </button>

          <UploadDropzone
            endpoint="bannerImage"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                const novaUrl = res[0].ufsUrl || res[0].url;
                setBannerUrl(novaUrl);
                setMostrarUpload(false);
              }
            }}
            onUploadError={(error) => {
              alert(`Erro no upload: ${error.message}`);
            }}
          />
        </div>
      )}
    </div>
  );
}
