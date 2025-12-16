// app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/frontend/providers/ThemeProvider";
import { HMSProvider } from "@frontend/providers/HMSProvider";
import Layout from "@/frontend/layout";
import AuthGuard from "@/frontend/components/AuthGuard";
import "../frontend/styles/globals.css";

export const metadata: Metadata = {
  title: "Chill.me",
  description: "100ms Video SDK Example",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <HMSProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <AuthGuard>
              <Layout>{children}</Layout>
            </AuthGuard>
          </ThemeProvider>
        </HMSProvider>
      </body>
    </html>
  );
}
