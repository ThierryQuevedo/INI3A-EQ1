import Link from "next/link";
export default function Footer(){
    return(
        <footer className="h-20 bg-green-500">
            <h1>footer</h1>
            <nav>
                <Link href='/'>sobre nos</Link>
            </nav>
        </footer>
    )
}