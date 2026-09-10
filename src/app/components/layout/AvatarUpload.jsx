"use client";

import { useState } from "react";
import { Camera, X } from "lucide-react";
import { UploadDropzone } from "@uploadthing/react";

export default function AvatarUpload({ usuario }) {
  const [mostrarUpload, setMostrarUpload] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(usuario?.urlImagem || null);

  // Pega a origem atual dinamicamente + subcaminho + barra final
  const uploadUrl = typeof window !== "undefined"
    ? `${window.location.origin}/26-marcaai/api/uploadthing/`
    : "http://localhost:3000/26-marcaai/api/uploadthing/";

  return (
    <div className="relative inline-block">
      <div className="relative group w-28 h-28 rounded-full overflow-hidden border-4 border-background bg-muted flex items-center justify-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Foto de perfil"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl font-bold text-muted-foreground">
            {usuario?.nome ? usuario.nome[0].toUpperCase() : "U"}
          </span>
        )}

        <button
          type="button"
          onClick={() => setMostrarUpload(true)}
          aria-label="Alterar foto de perfil"
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 cursor-pointer flex items-center justify-center"
        >
          <Camera className="text-white" aria-hidden="true" />
        </button>
      </div>

      {mostrarUpload && (
        <div
          role="dialog"
          aria-label="Enviar nova foto de perfil"
          className="absolute top-full left-0 mt-2 bg-card p-4 rounded-xl shadow-elevated border border-border flex flex-col items-center w-72 z-50"
        >
          <button
            type="button"
            onClick={() => setMostrarUpload(false)}
            aria-label="Fechar"
            className="self-end h-8 w-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive mb-2 transition-colors cursor-pointer"
          >
            <X size={18} aria-hidden="true" />
          </button>

          <UploadDropzone
            endpoint="profilePicture"
            url={uploadUrl} 
            config={{
              url: uploadUrl,
            }}
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                const novaUrl = res[0].ufsUrl || res[0].url;
                setAvatarUrl(novaUrl);
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