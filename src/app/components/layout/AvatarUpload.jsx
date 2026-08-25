"use client";

import { useState } from "react";
import { Pencil, User, X } from "lucide-react";
import { UploadDropzone } from "@uploadthing/react";
import { atualizarFotoPerfil } from "@/app/actions/auth.actions";

export default function AvatarUpload({ usuario, inicialNome }) {
  const [mostrarUpload, setMostrarUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState(usuario?.urlImagem || null);

  return (
    <div className="relative flex flex-col items-center">
      <div className="bg-gradient-to-tr from-tcc-laranja to-amber-400 w-28 h-28 rounded-full flex items-center justify-center mb-4 shadow-xl border-4 border-tcc-azul-deep relative group transition-transform duration-300 hover:scale-105">

        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Foto de perfil"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-white text-4xl font-bold tracking-wider font-urbanist drop-shadow-md">
            {inicialNome}
          </span>
        )}

        <button
          type="button"
          onClick={() => setMostrarUpload(true)}
          aria-label="Alterar foto de perfil"
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-200 rounded-full cursor-pointer flex flex-col items-center justify-center"
        >
          <Pencil className="text-white" aria-hidden="true" />
        </button>

        <div className="absolute bottom-0 right-0 bg-card p-1.5 rounded-full shadow-soft border border-border">
          <User size={16} className="text-tcc-azul-darker" aria-hidden="true" />
        </div>
      </div>

      {mostrarUpload && (
        <div role="dialog" aria-label="Enviar nova foto de perfil" className="absolute top-32 z-50 bg-card p-4 rounded-xl shadow-elevated border border-border flex flex-col items-center w-72">
          <button
            type="button"
            onClick={() => setMostrarUpload(false)}
            aria-label="Fechar"
            className="self-end h-9 w-9 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive mb-2 transition-colors cursor-pointer"
          >
            <X size={20} aria-hidden="true" />
          </button>

          <UploadDropzone
            endpoint="profilePicture"
            onClientUploadComplete={(res) => {
              if (res && res.length > 0) {
                const novaUrl = res[0].ufsUrl || res[0].url;
                setImageUrl(novaUrl);
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
