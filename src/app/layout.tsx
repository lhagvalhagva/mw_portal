// app/layout.tsx
import { Toaster } from "@/components/ui/sonner";
import { LocaleProvider } from "@/contexts/LocaleContext";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>
        <LocaleProvider>
          {children}
          <Toaster position="top-center" richColors />
        </LocaleProvider>
      </body>
    </html>
  );
}