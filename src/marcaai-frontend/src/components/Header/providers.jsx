"use client";

import { ThemeProvider } from "next-themes";

export function Providers({ children }) {
  return (
    // Alteramos para forçar um tema fixo inicial e desativar o enableSystem
    // Isso impede que a biblioteca injete a tag <script> que quebra o Next 16.2
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false} 
      forcedTheme="light"
    >
      {children}
    </ThemeProvider>
  );
}