"use client";

import { cn } from "@/lib/utils";

export default function Switch({ checked, onChange, disabled = false, label, id, className = "" }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-[background-color,border-color,opacity] duration-300 ease-apple cursor-pointer disabled:opacity-90 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card",
        checked ? "bg-primary border-primary" : "bg-muted border-border",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="inline-block h-5 w-5 rounded-full bg-white shadow-soft"
        style={{
          transform: checked ? "translateX(calc(var(--spacing) * 6))" : "translateX(var(--spacing))",
          transition: "transform 300ms var(--ease-apple)",
        }}
      />
    </button>
  );
}
