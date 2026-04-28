import { loginAction } from "../../actions/action_login";
import Link from 'next/link';
import Image from "next/image";

export default function loginPage() {
  return (
    <div className="bg-gray-100 flex py-1 h-screen w-full">
      <div className="bg-tcc-azul-dark w-1/2 h-full">
        <div>
          <Image src='../../public/images/'/>
        </div>
        <div className="bg-tcc-laranja-deep h-80 w-80 rounded-full opacity-15 absolute top-120 left-120 "></div>
        <div className="bg-tcc-azul-light h-50 w-50 rounded-full opacity-15 absolute top-30 right-338 "></div>
      </div>
      <div className="bg-cyan-300 w-1/2 h-full z-2">
        <h1>login</h1>
      </div>
    </div>
  );
}