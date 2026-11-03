import { clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// A escala tipográfica própria (globals.css) precisa ser registrada como
// font-size; sem isso o tailwind-merge trata `text-caption` como cor e o
// descarta quando a mesma lista tem `text-primary`, `text-foreground` etc.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["caption", "body-sm", "body", "body-lg", "h6", "h5", "h4", "h3", "h2", "h1"] }],
    },
  },
})

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
