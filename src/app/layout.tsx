// app/layout.tsx
import type { Metadata } from "next";
import "../frontend/styles/globals.css";

import { ThemeProvider } from "@/frontend/providers/ThemeProvider";
import { HMSProvider } from "@frontend/providers/HMSProvider";
import Layout from "@/frontend/layout";
import AuthGuard from "@/frontend/components/AuthGuard";

export const metadata: Metadata = {
  title: "Chill.me",
  description: "100ms Video SDK Example",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <HMSProvider>
      <html lang="en">
        <body>
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
        </body>
      </html>
    </HMSProvider>
  );
}
