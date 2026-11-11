import { clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// registra a escala tipografica no tailwind merge
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
