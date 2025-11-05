"use client";

import { ThemeProvider } from "@/components/ui/theme-provider";
import NavbarWrapper from "@/components/ui/NavbarWrapper";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        >
            <NavbarWrapper />
            {children}
        </ThemeProvider>
    );
}
