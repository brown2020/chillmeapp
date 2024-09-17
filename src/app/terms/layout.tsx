import AboutFooter from "@/components/AboutFooter";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4">{children}</div>
      <AboutFooter />
    </div>
  );
}
