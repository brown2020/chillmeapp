// app/layout.tsx
import type { Metadata } from "next";
import "../frontend/styles/globals.css";

import { ClientProvider } from "@/frontend/components/ClientProvider";
import { ThemeProvider } from "@/frontend/providers/ThemeProvider";
import Layout from "@/frontend/layout";

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
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Layout>
            {/* Use the client-only component */}
            <ClientProvider>{children}</ClientProvider>
          </Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
