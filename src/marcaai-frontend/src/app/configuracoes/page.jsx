"use client";
import { use, useState } from "react";
import { UploadButton } from "@uploadthing/react";

export default function ProfileUpload(){
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [bannerUrl, setBannerUrl] = useState(null);
    return(
        <main className="max-w-3xl mx-auto p-8 space-y-12">
      <h1 className="text-2xl font-bold">Personalizar Perfil</h1>

      {/* --- SEÇÃO DO BANNER --- */}
      <section className="space-y-4 border p-6 rounded-lg">
        <h2 className="text-xl font-semibold">Banner do Perfil</h2>
        
        {/* Preview do Banner */}
        <div className="w-full h-40 bg-gray-200 rounded-md overflow-hidden flex items-center justify-center">
          {bannerUrl ? (
            <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500">Sem banner (1200x400)</span>
          )}
        </div>

        {/* Botão de Upload apontando para o endpoint "bannerImage" */}
        <UploadButton
          endpoint="bannerImage"
          onClientUploadComplete={(res) => {
            console.log("Arquivos do banner:", res);
            setBannerUrl(res[0].url); // Atualiza a imagem na tela
            alert("Banner atualizado com sucesso!");
          }}
          onUploadError={(error) => {
            alert(`Erro no upload: ${error.message}`);
          }}
        />
      </section>

      {/* --- SEÇÃO DA FOTO DE PERFIL --- */}
      <section className="space-y-4 border p-6 rounded-lg">
        <h2 className="text-xl font-semibold">Foto de Perfil</h2>
        
        {/* Preview do Avatar */}
        <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center border-4 border-white shadow-sm">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500 text-xs text-center">Sem foto</span>
          )}
        </div>

        {/* Botão de Upload apontando para o endpoint "profilePicture" */}
        <UploadButton
          endpoint="profilePicture"
          onClientUploadComplete={(res) => {
            console.log("Arquivos do perfil:", res);
            setAvatarUrl(res[0].url); // Atualiza a imagem na tela
            alert("Foto de perfil atualizada!");
          }}
          onUploadError={(error) => {
            alert(`Erro no upload: ${error.message}`);
          }}
        />
      </section>

      <button className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition">
        Salvar Alterações
      </button>
    </main>
    )
}