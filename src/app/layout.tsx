// app/layout.tsx
import type { Metadata } from "next";
import "../frontend/styles/globals.css";

import { ClientProvider } from "@/frontend/components/ClientProvider";
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
      {/* Add Tailwind classes for dark mode background and text */}
      <body className="bg-black text-white min-h-screen">
        <Layout>
          {/* Use the client-only component */}
          <ClientProvider>{children}</ClientProvider>
        </Layout>
      </body>
    </html>
  );
}
