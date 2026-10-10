import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "w-full h-12 bg-background border border-input rounded-xl px-4 text-body text-foreground placeholder:text-muted-foreground outline-none transition-all duration-fast ease-apple",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent",
      "aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/40",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
