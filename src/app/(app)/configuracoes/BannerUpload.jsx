"use client";

import { useState } from "react";
import { Pencil, X } from "lucide-react";
import { UploadDropzone } from "@uploadthing/react";

export default function BannerUpload({ usuario }) {
  const [mostrarUpload, setMostrarUpload] = useState(false);
  const [bannerUrl, setBannerUrl] = useState(usuario.urlBanner || null);

  return (
    <div className="relative w-full">
      <div className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center relative group border border-gray-200">
        {bannerUrl ? (
          <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">Sem banner (1200x400)</span>
        )}

        <div
          onClick={() => setMostrarUpload(true)}
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
        >
          <Pencil className="text-white" />
        </div>
      </div>

      {mostrarUpload && (
        <div className="mt-3 bg-white p-4 rounded-xl shadow-2xl border border-gray-100 flex flex-col items-center w-full">
          <button
            onClick={() => setMostrarUpload(false)}
            className="self-end text-gray-500 hover:text-red-500 mb-2 transition-colors"
          >
            <X size={20} />
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
