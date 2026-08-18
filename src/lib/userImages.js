export async function userPerfilImage(){
    const usuario = await requireSession();
    return usuario.urlImage;
}
export async function userBannerImage(){
    const usuario = await requireSession();
    return usuario.urlBanner;
}