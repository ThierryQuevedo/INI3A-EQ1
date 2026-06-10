export default function SemHeaderLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-white text-black transition-colors duration-300">
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}