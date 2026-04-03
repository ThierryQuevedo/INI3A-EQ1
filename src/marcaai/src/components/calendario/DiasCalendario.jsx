export default function DiasCalendario({ numero }) {
  return (
    <div className="w-10 h-10 bg-sky-200 hover:bg-sky-300 rounded-md flex items-center justify-center text-sky-900 hover:text-sky-100 font-medium cursor-pointer transition-colors">
      {numero}
    </div>
  );
}