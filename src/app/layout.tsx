// app/layout.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { ThemeProvider } from "@/frontend/providers/ThemeProvider";
import Layout from "@/frontend/layout";
import AuthGuard from "@/frontend/components/AuthGuard";
import "../frontend/styles/globals.css";

export const metadata: Metadata = {
  title: "Chill.me",
  description: "Real-time video chat powered by LiveKit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <AuthGuard>
              <Layout>{children}</Layout>
            </AuthGuard>
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
