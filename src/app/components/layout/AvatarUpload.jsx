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

        <div
          onClick={() => setMostrarUpload(true)}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer flex flex-col items-center justify-center"
        >
          <Pencil className="text-white" />
        </div>

        <div className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-gray-200">
          <User size={16} className="text-tcc-azul-darker" />
        </div>
      </div>

      {mostrarUpload && (
        <div className="absolute top-32 z-50 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 flex flex-col items-center w-72">
          <button
            onClick={() => setMostrarUpload(false)}
            className="self-end text-gray-500 hover:text-red-500 mb-2 transition-colors"
          >
            <X size={20} />
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
