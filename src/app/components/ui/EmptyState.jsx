import Link from "next/link";
import { Button } from "./button";

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionHref, onAction, className = "" }) {
  return (
    <div className={`flex flex-col items-center text-center gap-3 py-12 px-6 ${className}`}>
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
          <Icon size={26} className="text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-1">
        <h3 className="text-body-lg font-bold text-foreground">{title}</h3>
        {description && (
          <p className="text-body-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {actionLabel && actionHref && (
        <Button asChild className="mt-2">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && !actionHref && onAction && (
        <Button onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
