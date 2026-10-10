import { cn } from "@/lib/utils";

export function Card({ className, interactive = false, dashed = false, padding = "default", children, ...props }) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-2xl border",
        dashed ? "border-dashed border-border" : "border-border",
        padding === "default" && "p-5 sm:p-6",
        padding === "sm" && "p-4",
        padding === "none" && "p-0",
        interactive
          ? "shadow-soft transition-shadow duration-base ease-apple hover:shadow-card cursor-pointer"
          : "shadow-soft",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 mb-4", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3 className={cn("text-body-lg font-bold text-foreground", className)} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-body-sm text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 pt-4 mt-4 border-t border-border", className)} {...props}>
      {children}
    </div>
  );
}
