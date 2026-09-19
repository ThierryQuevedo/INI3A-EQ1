export default function ProgressBar() {
  return (
    <div
      role="status"
      aria-label="Carregando página"
      className="fixed top-0 left-0 right-0 z-[60] h-1 overflow-hidden bg-transparent"
    >
      <div className="h-full w-1/3 rounded-full bg-tcc-laranja animate-progress-indeterminate" />
    </div>
  );
}
