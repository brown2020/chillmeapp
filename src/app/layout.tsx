// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { ClientOnly } from "@/components/ClientOnly";

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
        {/* Use the client-only component */}
        <ClientOnly>{children}</ClientOnly>
      </body>
    </html>
  );
}
