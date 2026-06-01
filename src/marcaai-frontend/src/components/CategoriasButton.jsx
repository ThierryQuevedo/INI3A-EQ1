import Link from "next/link";
export default function CategoriasButton({link,texto}){
    return(
        <Link href={link} className="bg-orange-400 px-8 py-2 rounded-2xl">
            {texto}
        </Link>
    )
}