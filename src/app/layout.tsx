// app/layout.tsx
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}