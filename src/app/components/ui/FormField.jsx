export default function FormField({ id, label, error, hint, required = false, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-body-sm font-medium text-muted-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-body-sm text-destructive font-medium" role="alert">
          {error}
        </p>
      )}
      {!error && hint && <p className="mt-1.5 text-body-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}
